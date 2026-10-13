extends Control
## Dungeon Forge Day 1 vertical slice: resource collection, crafting, equipment,
## defense/guard combat, offline accrual, random event, collection and save/load.

const SAVE_PATH := "user://dungeon_forge_save.json"
const COLORS := {
    "background": Color("171d30"), "panel": Color("28344b"),
    "accent": Color("ffba66"), "text": Color("f5f1e6"),
    "muted": Color("aebed4"), "green": Color("8ee0b1")
}
const RECIPES := [
    {"name":"단검", "kind":"weapon", "ore":6, "crystal":0, "icon":"⚔"},
    {"name":"철갑옷", "kind":"armor", "ore":9, "crystal":0, "icon":"▣"},
    {"name":"수호 방패", "kind":"shield", "ore":7, "crystal":2, "icon":"⬡"},
    {"name":"마력 반지", "kind":"ring", "ore":4, "crystal":3, "icon":"◇"}
]
const EFFECTS := ["견고함", "화상", "흡혈", "보호막", "반격"]
const GRADES := ["일반", "고급", "희귀", "영웅", "전설"]

var gold := 60
var ore := 20
var crystals := 5
var hp := 100.0
var max_hp := 100.0
var enemy_hp := 70.0
var enemy_max_hp := 70.0
var stage := 1
var experience := 0
var is_boss := false
var guard_time := 0.0
var guard_cooldown := 0.0
var skill_cooldown := 0.0
var battle_elapsed := 0.0
var enemy_elapsed := 0.0
var save_elapsed := 0.0
var event_meter := 0
var reward_cooldown := 0.0
var crafting_focus := "balanced"
var inventory: Array = []
var equipped := {"weapon": -1, "armor": -1, "shield": -1, "ring": -1}
var collected := {}
var logs: Array[String] = []
var rng := RandomNumberGenerator.new()
var active_tab := "던전"
var main_panel: VBoxContainer
var header_label: Label
var resource_label: Label
var message_label: Label
var tab_buttons := {}

func _ready() -> void:
    rng.randomize()
    _load_save()
    _construct_ui()
    _refresh()
    _log("대장간에 오신 것을 환영합니다. 장비를 제작해 던전을 돌파하세요!")

func _notification(what: int) -> void:
    if what == NOTIFICATION_WM_CLOSE_REQUEST or what == NOTIFICATION_APPLICATION_PAUSED:
        _save()

func _process(delta: float) -> void:
    battle_elapsed += delta
    enemy_elapsed += delta
    save_elapsed += delta
    guard_time = maxf(0.0, guard_time - delta)
    guard_cooldown = maxf(0.0, guard_cooldown - delta)
    skill_cooldown = maxf(0.0, skill_cooldown - delta)
    reward_cooldown = maxf(0.0, reward_cooldown - delta)
    if battle_elapsed >= 1.1:
        battle_elapsed = 0.0
        _attack_enemy()
        _refresh()
    if enemy_elapsed >= 1.8:
        enemy_elapsed = 0.0
        _enemy_attack()
        _refresh()
    if save_elapsed >= 10.0:
        save_elapsed = 0.0
        _save()

func _attack_stat() -> float:
    var value := 10.0 + float(stage) * 0.8
    var item := _get_equipped("weapon")
    if not item.is_empty():
        value += float(item.get("power", 0))
    return value

func _defense_stat() -> float:
    var value := 3.0
    for slot in ["armor", "shield", "ring"]:
        var item := _get_equipped(slot)
        if not item.is_empty():
            value += float(item.get("defense", 0))
    return value

func _get_equipped(slot: String) -> Dictionary:
    var index: int = int(equipped.get(slot, -1))
    if index >= 0 and index < inventory.size():
        return inventory[index]
    return {}

func _has_effect(effect: String) -> bool:
    for slot in equipped.keys():
        if _get_equipped(str(slot)).get("effect", "") == effect:
            return true
    return false

func _attack_enemy() -> void:
    var damage := _attack_stat()
    if _has_effect("화상"):
        damage += 5.0
    enemy_hp -= damage
    if _has_effect("흡혈"):
        hp = minf(max_hp, hp + 3.0)
    if enemy_hp <= 0.0:
        _defeat_enemy()

func _defeat_enemy() -> void:
    var payout := 8 + stage * 3
    gold += payout
    ore += 2 + int(stage / 4)
    experience += 1
    event_meter += 1
    if is_boss:
        crystals += 2
        stage += 1
        is_boss = false
        _log("보스 격파! 새로운 스테이지 %d, 마력 결정 +2" % stage)
    else:
        if experience % 5 == 0:
            is_boss = true
            _log("⚡ 보스가 등장했습니다! 공격과 방어 스킬을 준비하세요.")
    if event_meter >= 7:
        event_meter = 0
        _random_event()
    enemy_max_hp = 70.0 + stage * 24.0 + (130.0 if is_boss else 0.0)
    enemy_hp = enemy_max_hp
    hp = minf(max_hp, hp + 12.0)

func _enemy_attack() -> void:
    var raw := 9.0 + stage * 2.8 + (15.0 if is_boss else 0.0)
    var damage := raw * 100.0 / (100.0 + _defense_stat())
    if guard_time > 0.0:
        damage *= 0.25
    if _has_effect("보호막"):
        damage *= 0.85
    hp -= damage
    if _has_effect("반격"):
        enemy_hp -= 4.0
    if enemy_hp <= 0.0:
        _defeat_enemy()
    if hp <= 0:
        hp = max_hp
        enemy_hp = enemy_max_hp
        _log("패배했지만 재화를 잃지 않았습니다. 방어구를 강화해 다시 도전하세요.")

func _guard() -> void:
    if guard_cooldown > 0:
        return
    guard_time = 2.2
    guard_cooldown = 8.0
    _log("🛡 방어 자세! 2.2초 동안 받는 피해 75% 감소")
    _refresh()

func _skill() -> void:
    if skill_cooldown > 0:
        return
    skill_cooldown = 10.0
    var damage := _attack_stat() * 3.2
    enemy_hp -= damage
    _log("⚔ 강타! %.0f 피해" % damage)
    if enemy_hp <= 0:
        _defeat_enemy()
    _refresh()

func _craft(recipe: Dictionary) -> void:
    var extra_crystal := 1 if crafting_focus != "balanced" else 0
    if ore < int(recipe["ore"]) or crystals < int(recipe["crystal"]) + extra_crystal:
        _log("제작 재료가 부족합니다. 던전에서 더 모아보세요.")
        return
    ore -= int(recipe["ore"])
    crystals -= int(recipe["crystal"]) + extra_crystal
    var roll := rng.randf()
    var tier := 0
    if roll >= 0.99: tier = 4
    elif roll >= 0.95: tier = 3
    elif roll >= 0.85: tier = 2
    elif roll >= 0.60: tier = 1
    var kind: String = recipe["kind"]
    var effect: String = EFFECTS[rng.randi_range(0, EFFECTS.size()-1)]
    var focused_defense: bool = crafting_focus == "defense"
    var focused_attack: bool = crafting_focus == "attack"
    var item := {
        "name": str(recipe["name"]), "kind":kind, "tier":tier,
        "effect":effect, "power":(6 + 5 * tier + (3 if focused_attack else 0)) if kind == "weapon" else 0,
        "defense":(3 + 4 * tier + (3 if focused_defense else 0)) if kind != "weapon" else 0
    }
    inventory.append(item)
    collected["%s-%s-%s" % [item["name"], tier, effect]] = true
    _log("✨ %s %s 제작! 효과: %s" % [GRADES[tier], item["name"], effect])
    if int(equipped.get(kind, -1)) < 0:
        equipped[kind] = inventory.size()-1
    _save()
    _refresh()

func _equip(index: int) -> void:
    if index < 0 or index >= inventory.size():
        return
    var item: Dictionary = inventory[index]
    equipped[str(item["kind"])] = index
    _log("%s 장착: %s" % [item["name"], item["effect"]])
    _save()
    _refresh()

func _random_event() -> void:
    var random_roll := rng.randi_range(0, 2)
    if random_roll == 0:
        crystals += 1
        _log("🎁 수상한 상자: 마력 결정 +1")
    elif random_roll == 1:
        ore += 8
        _log("⛏ 숨겨진 광맥: 광석 +8")
    else:
        gold += 35
        _log("🪙 떠돌이 상인: 골드 +35")

func _claim_idle() -> void:
    if reward_cooldown > 0.0:
        _log("탐험 보상 충전 중: %d초" % int(ceil(reward_cooldown)))
        return
    reward_cooldown = 60.0
    var bonus := 10 + 2 * stage
    gold += bonus * 2
    ore += bonus
    _log("자동 탐험 보상: 골드 +%d, 광석 +%d" % [bonus * 2, bonus])
    _save()
    _refresh()

func _load_save() -> void:
    if not FileAccess.file_exists(SAVE_PATH):
        return
    var file := FileAccess.open(SAVE_PATH, FileAccess.READ)
    if file == null:
        return
    var data = JSON.parse_string(file.get_as_text())
    if not data is Dictionary:
        return
    gold = int(data.get("gold", gold))
    ore = int(data.get("ore", ore))
    crystals = int(data.get("crystals", crystals))
    stage = int(data.get("stage", stage))
    reward_cooldown = maxf(0.0, float(data.get("reward_ready_at", 0)) - Time.get_unix_time_from_system())
    crafting_focus = str(data.get("crafting_focus", "balanced"))
    experience = int(data.get("experience", experience))
    inventory.assign(data.get("inventory", []))
    equipped = data.get("equipped", equipped)
    collected = data.get("collected", {})
    var seconds: int = clampi(int(Time.get_unix_time_from_system()) - int(data.get("last_played", 0)), 0, 28800)
    if seconds >= 60:
        gold += int(seconds / 20)
        ore += int(seconds / 60)
        logs.append("오프라인 %d분: 골드 +%d / 광석 +%d" % [seconds / 60, int(seconds / 20), int(seconds / 60)])

func _save() -> void:
    var file := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
    if file == null:
        return
    file.store_string(JSON.stringify({"gold":gold,"ore":ore,"crystals":crystals,"stage":stage,"experience":experience,"inventory":inventory,"equipped":equipped,"collected":collected,"reward_ready_at":Time.get_unix_time_from_system() + reward_cooldown,"crafting_focus":crafting_focus,"last_played":int(Time.get_unix_time_from_system())}))

func _log(entry: String) -> void:
    logs.push_front(entry)
    if logs.size() > 4:
        logs.resize(4)
    if is_instance_valid(message_label):
        message_label.text = "\n".join(logs)

func _construct_ui() -> void:
    var background := ColorRect.new()
    background.color = COLORS["background"]
    background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    add_child(background)
    var outer := VBoxContainer.new()
    outer.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    outer.add_theme_constant_override("separation", 14)
    outer.offset_left = 18
    outer.offset_right = -18
    outer.offset_top = 28
    outer.offset_bottom = -20
    add_child(outer)
    header_label = _label("⚒  던전 대장간", 30, COLORS["accent"])
    outer.add_child(header_label)
    resource_label = _label("", 17, COLORS["text"])
    outer.add_child(resource_label)
    var line := HSeparator.new()
    outer.add_child(line)
    var scroll := ScrollContainer.new()
    scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
    outer.add_child(scroll)
    main_panel = VBoxContainer.new()
    main_panel.size_flags_horizontal = Control.SIZE_EXPAND_FILL
    main_panel.add_theme_constant_override("separation", 12)
    scroll.add_child(main_panel)
    message_label = _label("", 14, COLORS["muted"])
    message_label.custom_minimum_size.y = 82
    outer.add_child(message_label)
    var nav := HBoxContainer.new()
    nav.add_theme_constant_override("separation", 4)
    outer.add_child(nav)
    for tab in ["던전", "대장간", "장비", "도감"]:
        var b := _button(tab, func(): _change_tab(tab))
        b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
        nav.add_child(b)
        tab_buttons[tab] = b

func _label(content: String, size: int, color: Color) -> Label:
    var label := Label.new()
    label.text = content
    label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
    label.add_theme_font_size_override("font_size", size)
    label.add_theme_color_override("font_color", color)
    return label

func _button(content: String, action: Callable) -> Button:
    var button := Button.new()
    button.text = content
    button.custom_minimum_size.y = 48
    button.add_theme_font_size_override("font_size", 16)
    button.pressed.connect(action)
    return button

func _entry(title: String, description: String) -> VBoxContainer:
    var block := VBoxContainer.new()
    block.add_theme_constant_override("separation", 6)
    block.add_child(_label(title, 21, COLORS["accent"]))
    block.add_child(_label(description, 15, COLORS["text"]))
    main_panel.add_child(block)
    return block

func _change_tab(tab: String) -> void:
    active_tab = tab
    _refresh()

func _refresh() -> void:
    if not is_instance_valid(main_panel):
        return
    resource_label.text = "🪙 %d 골드    ⛏ %d 광석    ✦ %d 결정" % [gold, ore, crystals]
    for button in tab_buttons.keys():
        tab_buttons[button].disabled = (button == active_tab)
    for child in main_panel.get_children():
        main_panel.remove_child(child)
        child.queue_free()
    if active_tab == "던전":
        _draw_dungeon()
    elif active_tab == "대장간":
        _draw_craft()
    elif active_tab == "장비":
        _draw_equipment()
    else:
        _draw_collection()

func _draw_dungeon() -> void:
    var enemy_name := "👹 던전 보스" if is_boss else "🟢 숲의 슬라임"
    _entry("🏰 던전 · %d층" % stage,
        "%s\n적 체력 %.0f / %.0f\n내 체력 %.0f / %.0f\n공격력 %.0f  |  방어력 %.0f" % [enemy_name, maxf(enemy_hp, 0), enemy_max_hp, maxf(hp, 0), max_hp, _attack_stat(), _defense_stat()])
    main_panel.add_child(_button("⚔ 강타 스킬 (쿨타임 %.0f초)" % skill_cooldown, _skill))
    main_panel.add_child(_button("🛡 방어 자세 (쿨타임 %.0f초)" % guard_cooldown, _guard))
    _entry("자동 전투", "전투는 자동으로 진행됩니다. 방어 자세는 짧은 시간 동안 피해를 75% 줄입니다. 보스전은 방어 타이밍과 장비 옵션이 중요합니다.")
    main_panel.add_child(_button("⛏ 탐험 보상 수령 (충전 %.0f초)" % reward_cooldown, _claim_idle))

func _draw_craft() -> void:
    _entry("🔥 장비 제작", "제작 방향을 선택하세요. 집중 제작은 결정 1개를 추가로 사용합니다.\n일반 60% · 고급 25% · 희귀 10% · 영웅 4% · 전설 1%")
    main_panel.add_child(_button("균형 제작" + (" ✓" if crafting_focus == "balanced" else ""), func(): _set_focus("balanced")))
    main_panel.add_child(_button("공격 집중 (무기 공격 +3)" + (" ✓" if crafting_focus == "attack" else ""), func(): _set_focus("attack")))
    main_panel.add_child(_button("방어 집중 (방어구 방어 +3)" + (" ✓" if crafting_focus == "defense" else ""), func(): _set_focus("defense")))
    for recipe in RECIPES:
        var rec: Dictionary = recipe
        var block := _entry("%s  %s" % [rec["icon"], rec["name"]], "광석 %d  |  결정 %d" % [rec["ore"], int(rec["crystal"]) + (1 if crafting_focus != "balanced" else 0)])
        block.add_child(_button("제작하기", func(): _craft(rec)))

func _draw_equipment() -> void:
    _entry("🛡 장비와 방어", "무기·갑옷·방패·반지를 각각 1개씩 장착합니다. 장착한 장비의 방어력과 특수효과가 전투에 적용됩니다.")
    if inventory.is_empty():
        _entry("장비 없음", "대장간에서 첫 장비를 제작해보세요.")
    for i in range(inventory.size()):
        var item: Dictionary = inventory[i]
        var idx := i
        var eq := " [장착 중]" if int(equipped.get(str(item["kind"]), -1)) == i else ""
        var block := _entry("%s %s%s" % [GRADES[int(item["tier"])], item["name"], eq], "공격 +%d · 방어 +%d · 옵션: %s" % [item["power"], item["defense"], item["effect"]])
        block.add_child(_button("장착하기", func(): _equip(idx)))

func _draw_collection() -> void:
    _entry("📖 발견 도감", "발견한 장비 조합: %d종\n서로 다른 재료와 제작 등급, 랜덤 옵션을 탐색해 보세요." % collected.size())
    if collected.is_empty():
        _entry("아직 발견한 장비 없음", "첫 제작을 하면 도감에 등록됩니다.")
    else:
        for key in collected.keys():
            main_panel.add_child(_label("✦ " + str(key), 15, COLORS["text"]))

func _set_focus(value: String) -> void:
    crafting_focus = value
    _save()
    _refresh()

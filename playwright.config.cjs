const {defineConfig,devices}=require('@playwright/test');
const projects=[
 {name:'desktop-chromium',use:{...devices['Desktop Chrome']}},
 {name:'mobile-chromium',use:{...devices['Pixel 7']}}
];
if(process.env.TEST_WEBKIT==='1')projects.push({name:'mobile-webkit',use:{...devices['iPhone 13']}});
module.exports=defineConfig({
 testDir:'./tests',
 testMatch:/.*\\.spec\\.js$/,
 timeout:30000,
 retries:process.env.CI?1:0,
 projects,
 use:{baseURL:'http://127.0.0.1:8765',headless:true,trace:'retain-on-failure'},
 webServer:{command:'python3 -m http.server 8765 --bind 127.0.0.1',url:'http://127.0.0.1:8765',reuseExistingServer:!process.env.CI,timeout:30000},
 reporter:'list'
});

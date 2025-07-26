const { expect } = require('chai');

const LOGIN_URL = 'https://testathon.live/signin';
const usernames = [
    'demouser',
    'image_not_loading_user',
    'existing_orders_user',
    'fav_user',
    'locked_user'
];
const validPassword = 'testingisfun99';

describe('BrowserStack Login Validation', () => {
    beforeEach(async () => {
        await browser.url(LOGIN_URL);
    });

    it('should load the login page and show logo', async () => {
        const logo = await $('img');
        expect(await logo.isDisplayed()).to.be.true;
    });

    it('should not allow login with empty fields', async () => {
        const loginBtn = await $('#login-btn');
        await loginBtn.click();
        const alert = await $('.api-error');
        expect(await alert.getText()).to.include('Please fill out username and password');
    });

    usernames.forEach(username => {
        it(`should login successfully with valid user: ${username}`, async () => {
            // Select Username
            const userField = await $('//div[contains(text(), "Select Username")]');
            await userField.click();
            const userOption = await $(`//div[contains(text(), "${username}")]`);
            await userOption.click();

            // Select Password
            const passField = await $('//div[contains(text(), "Select Password")]');
            await passField.click();
            const passOption = await $(`//div[contains(text(), "${validPassword}")]`);
            await passOption.click();

            // Click Login
            const loginBtn = await $('#login-btn');
            await loginBtn.click();

            // ✅ LOGOUT
            const logoutBtn = await $('#logout');
            await logoutBtn.waitForDisplayed({ timeout: 5000 });
            await logoutBtn.click();

            // ✅ Verify user is back on login page
            await browser.waitUntil(
                async () => (await browser.getUrl()).includes('signin'),
                {
                    timeout: 5000,
                    timeoutMsg: 'Expected to return to signin page after logout',
                }
            );
        });
    });

    it('should show error for invalid password', async () => {
        const userField = await $('//div[contains(text(), "Select Username")]');
        await userField.click();
        const userOption = await $(`//div[contains(text(), "demouser")]`);
        await userOption.click();

        const passField = await $('//div[contains(text(), "Select Password")]');
        await passField.click();
        const passOption = await $(`//div[contains(text(), "wrongpassword")]`);
        await passOption.click();

        const loginBtn = await $('#login-btn');
        await loginBtn.click();

        const alert = await $('.api-error');
        expect(await alert.getText()).to.include('Incorrect username or password');
    });
});

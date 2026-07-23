const { Given, When, Then, Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

// Aumentamos el límite de tiempo a 15 segundos
setDefaultTimeout(15 * 1000);

let driver;

Before(async function () {
    driver = await new Builder().forBrowser('chrome').build();
});

Given('estoy en la página de inicio de sesión de Safe Ride', async function () {
    await driver.get('http://localhost:5173/login'); 
});

When('ingreso mi correo {string} y contraseña {string}', async function (correo, password) {
    // Usamos el selector por ID (#email) que coincide con tu código de React
    const emailInput = await driver.wait(
        until.elementLocated(By.css('#email')), 
        10000
    );
    await emailInput.sendKeys(correo);
    
    // Usamos el selector por ID (#password)
    const passwordInput = await driver.findElement(By.css('#password'));
    await passwordInput.sendKeys(password);
});

When('hago clic en el botón de ingresar', async function () {
    // Tu botón tiene type="submit", así que este selector funciona perfecto
    const btnIngresar = await driver.wait(
        until.elementLocated(By.css('button[type="submit"]')),
        5000
    );
    await btnIngresar.click();
});

Then('deberia ser redirigido al dashboard principal', async function () {
    // Buscamos el h1 que contiene el saludo "Hola, Viajero" exclusivo del dashboard
    await driver.wait(until.elementLocated(By.css('h1.text-4xl')), 5000);
});

After(async function () {
    if (driver) {
        await driver.quit();
    }
});
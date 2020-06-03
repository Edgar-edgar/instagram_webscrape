const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const [response] = await Promise.all([
        page.waitForResponse(response => response.url().includes('.jpg')),
        page.goto('https://instagram.fmnl3-1.fna.fbcdn.net/v/t51.2885-15/sh0.08/e35/c0.50.840.840a/s640x640/101154103_270894477365893_153213482377603250_n.jpg?_nc_ht=instagram.fmnl3-1.fna.fbcdn.net&_nc_cat=101&_nc_ohc=vSKyT9yhoNcAX8z-7Ij&oh=72c5e524fe4d10bef398ba6f06367b7e&oe=5F008D4F')
    ]);
    const buffer = await response.buffer();
    console.log('data:image/png;base64,' + buffer.toString('base64'));

    await browser.close();
})();
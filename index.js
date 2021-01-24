const puppeteer = require('puppeteer');
const fastify = require('fastify')({ logger: true });

const chromeOptions = {
  headless: true,
  defaultViewport: null,
  args: ['--incognito', '--no-sandbox', '--single-process', '--no-zygote'],
};

const screen = async ({ title, datestring }) => {
  const browser = await puppeteer.launch({
    ...chromeOptions,
    defaultViewport: { width: 1700, height: 700 },
  });

  const page = await browser.newPage();
  await page.goto(
    `https://pills.danieleirsuti.dev/screenshot?title=${title}&datestring=${datestring}`,
    {
      waitUntil: 'load',
    }
  );

  const element = await page.waitForSelector('#screenshot', {
    timeout: 2000,
  });

  await page.evaluate((value) => {
    var element = document.querySelector('#screenshot-title');
    element.innerText = value;
  }, title);

  await page.evaluate((value) => {
    var element = document.querySelector('#screenshot-datestring');
    element.innerText = value;
  }, Intl.DateTimeFormat('en-US').format(new Date(datestring)));

  //   console.log(element, 'element');
  const screen = await element.screenshot({ type: 'png' });
  //   const screen = await page.screenshot();

  return screen;
};

// Declare a route
fastify.get('/', async (request, reply) => {
  return reply
    .headers({
      'Content-Type': 'image/png',
    })
    .send(
      await screen({
        title: request.query.title,
        datestring: request.query.datestring,
      })
    );
});

// Run the server!
const start = async () => {
  try {
    await fastify.listen(process.env.PORT || 4000);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

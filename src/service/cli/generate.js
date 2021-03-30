'use strict';

const {
  getRandomInt,
  shuffle,
  formatDate,
  getContent
} = require(`../../utils`);
const fsPromises = require(`fs`).promises;
const chalk = require(`chalk`);

const DEFAULT_COUNT = 1;
const FILE_NAME = `mocks.json`;

const MAX_COUNT_PUBLICATION = 1000;
const MAX_COUNT_ANNOUNCE_SENTENCES = 5;
const MAX_COUNT_FULL_TEXT_SENTENCES = 10;

const getRandomDate = () => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 3);

  const randomDate = new Date(startDate.getTime() + Math.random() * (Date.now() - startDate.getTime()));

  return formatDate(randomDate);
};

const generatePublications = async (count) => {
  const [titles, categories, sentences] = await Promise.all(
      [getContent(`titles`), getContent(`categories`), getContent(`sentences`)]
  );

  return Array(count).fill({}).map(() => ({
    title: titles[getRandomInt(0, titles.length - 1)],
    announce: shuffle(sentences).slice(0, getRandomInt(1, MAX_COUNT_ANNOUNCE_SENTENCES)).join(` `),
    fullText: shuffle(sentences).slice(0, MAX_COUNT_FULL_TEXT_SENTENCES).join(` `),
    createdDate: getRandomDate(),
    category: shuffle(categories).slice(0, getRandomInt(1, categories.length - 1))
  }))
};

module.exports = {
  name: `--generate`,
  async run(args) {
    const [count] = args;
    const countPublication = Number.parseInt(count, 10) || DEFAULT_COUNT;

    if (countPublication > MAX_COUNT_PUBLICATION) {
      return console.error(`Не больше 1000 публикаций`);
    }

    try {
      const content = JSON.stringify(await generatePublications(countPublication));
      await fsPromises.writeFile(FILE_NAME, content);
      return console.info(chalk.green(`Operation success. File created.`));
    } catch (e) {
      return console.error(chalk.red(`Can't write data to file...`));
    }
  }
};

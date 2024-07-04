const pool = require("../db");
require("dotenv").config();
const fs = require("fs");
const path = require("path");
async function ensureTableExists(client) {
  const createTableQuery = `
      CREATE TABLE IF NOT EXISTS public.users (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        age INT NOT NULL,
        address JSONB NULL,
        additional_info JSONB NULL
      );
    `;
  await client.query(createTableQuery);
}

async function calculateAgeDistribution() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT age FROM public.users");
    const ageGroups = {
      "< 20": 0,
      "20 to 40": 0,
      "40 to 60": 0,
      "> 60": 0,
    };

    const totalUsers = res.rowCount;
    res.rows.forEach((row) => {
      if (row.age < 20) {
        ageGroups["< 20"]++;
      } else if (row.age <= 40) {
        ageGroups["20 to 40"]++;
      } else if (row.age <= 60) {
        ageGroups["40 to 60"]++;
      } else {
        ageGroups["> 60"]++;
      }
    });

    const ageDistribution = Object.entries(ageGroups).map(
      ([ageGroup, count]) => ({
        ageGroup,
        percentage: ((count / totalUsers) * 100).toFixed(2),
      })
    );

    console.log("Age-Group % Distribution");
    ageDistribution.forEach((group) => {
      console.log(`${group.ageGroup}: ${group.percentage}%`);
    });
  } finally {
    client.release();
  }
}

const uploadFileData = async (req, res) => {
  let obj = [];
  console.log(process.env.DB_PORT);
  const filePath = path.join("files", process.env.CSV_FILE_NAME);
  const parsedData = parseCSV(filePath);
  function parseCSV(filePath) {
    console.log(filePath);
    const data = fs.readFileSync(filePath, "utf8");

    const lines = data.trim().split(/\r?\n/);
    console.log(lines);
    const result = [];

    lines.forEach((line) => {
      const columns = line.split(",");

      result.push(columns);
    });

    return result;
  }

  let firstLine = parsedData[0];

  let result = {};

  let headers = parsedData[0];

  // Iterate over each data row (excluding the header)
  for (let index = 1; index < parsedData.length; index++) {
    let data = parsedData[index];

    let newObj = {};

    // Map each data element to the corresponding key in originalObject dynamically
    for (let i = 0; i < headers.length; i++) {
      let header = headers[i];
      let keys = header.split("."); // Handle nested keys

      // Assign value in the nested structure
      let currentLevel = newObj;
      for (let j = 0; j < keys.length; j++) {
        let key = keys[j].trim().toLowerCase();
        if (j === keys.length - 1) {
          currentLevel[key] = data[i].replace(/"/g, ""); // Remove double quotes
        } else {
          currentLevel[key] = currentLevel[key] || {};
          currentLevel = currentLevel[key];
        }
      }
    }

    obj.push(newObj);
    // Merge newObj into result (you might want to adjust this depending on your use case)
    Object.assign(result, newObj);
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await ensureTableExists(client);
    await client.query("DELETE FROM public.users");
    for (const item of obj) {

      const { name, age, Address, ...additionalInfo } = item;
      const fullName = `${name?.firstname} ${name?.lastname}`;
      const addressJson = JSON.stringify(Address);

      await client.query(
        `INSERT INTO public.users (name, age, address, additional_info) VALUES ($1, $2, $3, $4)`,
        [fullName, age, addressJson || null, JSON.stringify(additionalInfo)]
      );
    }
    await client.query("COMMIT");
    await calculateAgeDistribution();
    res.status(200).json("done");
  } catch (e) {
    await client.query("ROLLBACK");

    res.status(400).json("error");
    throw e;
  } finally {
    client.release();
  }
};

module.exports = {
  uploadFileData,
};
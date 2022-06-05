import {
  readCSVObjects,
  writeCSVObjects,
} from "https://deno.land/x/csv@v0.6.0/mod.ts";
import { MSA } from "./MSA.ts";

// populate MSA.allMSAs with data
await read("./us2020.csv");
await read("./pr2020.csv");
await read("./ca2016.csv");

// get the top 128 MSAs by population
MSA.allMSAs.sort((a, b) => b.pop - a.pop);
const top128 = MSA.allMSAs.slice(0, 128);

// for as long as
// i) the lowest MSA by population per team has only one team and
// ii) the highest MSA by pop/team would still be on the list if we gave it one more team
// take the MSA which has the highest population per team and give it one more team, and remove the lowest MSA from the list.
// (the second condition never matters for this particular data set)
let [top] = top128;
let last = top128.pop() as MSA;
while (last.teams < 2 && top.nextPop > last.divPop) {
  top.teams += 1;
  top128.sort((a, b) => b.divPop - a.divPop);
  [top] = top128;
  last = top128.pop() as MSA;
}

// put the last team we popped off back on the stack, we're keeping it after all
top128.push(last);

// sort by overall population descending and write to CSV
top128.sort((a, b) => b.pop - a.pop);
await writeResults();



// helpers
async function read(filename: string) {
  const file = await Deno.open(filename);
  for await (const row of readCSVObjects(file)) MSA.ingest(row);
  file.close();
}

async function writeResults() {
  const file = await Deno.open("./results.csv", {
    write: true,
    create: true,
    truncate: true,
  });
  const header = ["name", "teams", "pop"];
  const output = top128.map(({ name, pop, teams }) => ({
    name,
    pop: `${pop}`,
    teams: `${teams}`,
  }));

  await writeCSVObjects(file, output, { header });

  file.close();
}

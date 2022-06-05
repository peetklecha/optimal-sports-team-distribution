import { readCSVObjects } from "https://deno.land/x/csv@v0.6.0/mod.ts";

interface Row {
	msa: string, pop: string,
}

function isRow(obj: unknown): obj is Row {
	return typeof obj === 'object' && obj !== null && 'msa' in obj && 'pop' in obj
}

class MSA {
	name: string
	pop: number
	divisions: number
	constructor(row: Row) {
		this.name = row.msa;
		this.pop = +row.pop.replaceAll(',', '').replaceAll(/\s/g, '').replaceAll(/\t/g, '')
		this.divisions = 1
	}

	get divPop() { return this.pop / this.divisions }
	get nextPop() { return this.pop / (this.divisions + 1) }
  get shortname() { return this.name.slice(0, 10) }
}

const data: MSA[] = [];

async function read(filename: string) {
	const file = await Deno.open(filename);
	for await (const row of readCSVObjects(file)) {
		if (isRow(row)) data.push(new MSA(row));
	}
	file.close();
}

await read('./us2020.csv');
await read('./pr2020.csv');
await read('./ca2016.csv');

data.sort((a, b) => b.pop - a.pop)

const top128 = data.slice(0, 128)

console.log(top128.reduce((sum, msa) => sum + msa.divisions, 0))

function notDone(){
	const [first] = top128;
	const last = top128.at(-1) as MSA;
	return first.nextPop > last.divPop;
	// const prospect = top128.reduce((nextBest, msa) => nextBest.nextPop > msa.nextPop ? nextBest : msa);
	// const last = top128.reduce((worst, msa) => worst.divPop < msa.divPop ? worst : msa);
	// if (prospect.nextPop > last.divPop) {
	// 	console.log(`${prospect.name} (/${prospect.divisions + 1} => ${prospect.nextPop}) > ${last.name} (/${prospect.divisions} => ${prospect.divPop})`)
	// 	return true;
	// }
}

let error = false;

while (notDone()) {
  const [top] = top128;
	const msa = top128.pop() as MSA;
	if (msa.divisions > 1) {
		top128.push(msa);
    console.log(`${top.shortname}: !${top.divisions} => ${top.divisions + 1}!`)
    console.log(`!<-! ${msa.shortname}`);
		error = true;
		break;
	}
	// const top = top128.reduce((nextBest, msa) => nextBest.nextPop > msa.nextPop ? nextBest : msa);
	top.divisions += 1;
	console.log(`${top.shortname}: ${top.divisions -1} => ${top.divisions}`)
	console.log(` <- ${msa.name}`)
	top128.sort((a,b) => b.divPop - a.divPop)
}

top128.sort((a,b) => b.pop - a.pop)

console.log(`Name of MSA         \tTeams\tPop/Team\tTotal Pop`)
for (const msa of top128) {
	console.log(`${msa.name.slice(0,20)}${msa.name.length < 20 ? " ".repeat(20 - msa.name.length) : ''}\t${msa.divisions}\t${msa.divPop.toFixed(0)}\t\t${msa.pop}`)
}

console.log(top128.reduce((sum, msa) => sum + msa.divisions, 0))
if (error) console.log('oops!')

const top128raw = data.slice(0, 128)

let divs = 1
const [nyc] = data
while (nyc.pop / divs > (top128raw.at(-divs) as MSA).pop) divs += 1;
console.log(`NYC/${divs} = ${nyc.pop/divs}`);

export { data, nyc, divs }

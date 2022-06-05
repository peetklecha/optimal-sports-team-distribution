interface Row {
  msa: string;
  pop: string;
}

export class MSA {
  static allMSAs: MSA[] = [];
  name: string;
  pop: number;
  teams = 1;
  constructor(row: Row) {
    this.name = row.msa;
    this.pop = +row.pop.replace(/[^0-9]/g, '');
  }

  get divPop() {
    return this.pop / this.teams;
  }
  get nextPop() {
    return this.pop / (this.teams + 1);
  }
  get shortname() {
    return this.name.slice(0, 10);
  }

  static isRow(obj: unknown): obj is Row {
    return typeof obj === "object" && obj !== null && "msa" in obj &&
      "pop" in obj;
  }

  static ingest(row: unknown) {
    if (this.isRow(row)) this.allMSAs.push(new this(row));
  }
}

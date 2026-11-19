import { toPoints } from "./transform";

describe("toPoints", () => {
  it("parses year strings into Dates and keeps values", () => {
    const points = toPoints([{ date: "2015", value: 10 }]);
    expect(points).toHaveLength(1);
    expect(points[0].date.getFullYear()).toBe(2015);
    expect(points[0].value).toBe(10);
  });

  it("sorts points from oldest to newest", () => {
    const points = toPoints([
      { date: "2020", value: 3 },
      { date: "2018", value: 1 },
      { date: "2019", value: 2 },
    ]);
    expect(points.map((p) => p.date.getFullYear())).toEqual([2018, 2019, 2020]);
  });

  it("skips observations with an invalid date", () => {
    const points = toPoints([
      { date: "not-a-year", value: 1 },
      { date: "2021", value: 2 },
    ]);
    expect(points).toHaveLength(1);
  });
});

import { nearestPoint, toPoints } from "./transform";

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

describe("nearestPoint", () => {
  const year = (y: number) => new Date(y, 0, 1);
  const points = [
    { date: year(2018), value: 1 },
    { date: year(2019), value: 2 },
    { date: year(2020), value: 3 },
  ];

  it("returns undefined for an empty array", () => {
    expect(nearestPoint([], year(2019))).toBeUndefined();
  });

  it("returns the exact match when the date is in the data", () => {
    expect(nearestPoint(points, year(2019))?.value).toBe(2);
  });

  it("snaps to the closer neighbour when the date falls between two points", () => {
    expect(nearestPoint(points, new Date(2019, 2, 1))?.value).toBe(2); // March 2019 → 2019
    expect(nearestPoint(points, new Date(2019, 10, 1))?.value).toBe(3); // Nov 2019 → 2020
  });

  it("clamps to the first / last point when the date is out of range", () => {
    expect(nearestPoint(points, year(2000))?.value).toBe(1);
    expect(nearestPoint(points, year(2050))?.value).toBe(3);
  });
});

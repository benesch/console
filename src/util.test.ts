import { groupBy } from "./util";

test("groupBy", () => {
  const array = [
    { k: "a", v: 1 },
    { k: "b", v: 1 },
    { k: "a", v: 2 },
  ];
  const grouped = groupBy(array, (o) => o.k);
  expect(grouped).toStrictEqual(
    new Map(
      Object.entries({
        a: [
          { k: "a", v: 1 },
          { k: "a", v: 2 },
        ],
        b: [{ k: "b", v: 1 }],
      })
    )
  );
});

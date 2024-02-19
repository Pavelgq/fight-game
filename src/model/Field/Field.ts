export type SectionParams = {
  title: string;
};

const disableField = [
  [
    {
      title: "голова слева",
    },
    {
      title: "голова",
    },
    {
      title: "голова справа",
    },
  ],
  [
    {
      title: "корпус слева",
    },
    {
      title: "корпус",
    },
    {
      title: "корпус справа",
    },
  ],
  [
    {
      title: "ноги слева",
    },
    {
      title: "ноги",
    },
    {
      title: "ноги справа",
    },
  ],
];

export type FieldAction;

export type SectionState = [
  [null, null, null],
  [null, null, null],
  [null, null, null]
];

export class Field {
  sections: SectionParams[][] = disableField;

  constructor() {}
}

export type DefenseConstructorProps = {
  head: number;
  body: number;
  foot: number;
};
export class Defense {
  head: number;
  body: number;
  foot: number;

  constructor({ head, body, foot }: DefenseConstructorProps) {
    this.head = head;
    this.body = body;
    this.foot = foot;
  }
}

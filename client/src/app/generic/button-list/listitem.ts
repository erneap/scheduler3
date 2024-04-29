export class ListItem {
  public id: string = '';
  public label: string = '';
  sortid: number = 0;

  constructor(
    id: string,
    label: string,
    sort?: number
  ) {
    this.id = id;
    this.label = label;
    if (sort) {
      this.sortid = sort;
    }
  }

  compareTo(other?: ListItem): number {
    if (other) {
      return (this.sortid < other.sortid) ? -1 : 1;
    }
    return -1;
  }
}
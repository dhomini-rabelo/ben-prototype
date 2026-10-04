export abstract class WatchedList<T> {
  public currentItems: T[]
  private initial: T[]
  private new: T[]
  private removed: T[]

  constructor(initialItems?: T[]) {
    this.currentItems = initialItems || []
    this.initial = initialItems || []
    this.new = []
    this.removed = []
  }

  abstract compareItems(a: T, b: T): boolean

  public getItems(): T[] {
    return this.currentItems
  }

  public getNewItems(): T[] {
    return this.new
  }

  public getRemovedItems(): T[] {
    return this.removed
  }

  private isCurrentItem(item: T): boolean {
    return (
      this.currentItems.filter((candidate: T) =>
        this.compareItems(item, candidate),
      ).length !== 0
    )
  }

  private isNewItem(item: T): boolean {
    return (
      this.new.filter((candidate: T) => this.compareItems(item, candidate))
        .length !== 0
    )
  }

  private isRemovedItem(item: T): boolean {
    return (
      this.removed.filter((candidate: T) => this.compareItems(item, candidate))
        .length !== 0
    )
  }

  private removeFromNew(item: T): void {
    this.new = this.new.filter(
      (candidate) => !this.compareItems(candidate, item),
    )
  }

  private removeFromCurrent(item: T): void {
    this.currentItems = this.currentItems.filter(
      (candidate) => !this.compareItems(item, candidate),
    )
  }

  private removeFromRemoved(item: T): void {
    this.removed = this.removed.filter(
      (candidate) => !this.compareItems(item, candidate),
    )
  }

  private wasAddedInitially(item: T): boolean {
    return (
      this.initial.filter((candidate: T) => this.compareItems(item, candidate))
        .length !== 0
    )
  }

  public exists(item: T): boolean {
    return this.isCurrentItem(item)
  }

  public add(item: T): void {
    if (this.isRemovedItem(item)) {
      this.removeFromRemoved(item)
    }

    if (!this.isNewItem(item) && !this.wasAddedInitially(item)) {
      this.new.push(item)
    }

    if (!this.isCurrentItem(item)) {
      this.currentItems.push(item)
    }
  }

  public remove(item: T): void {
    this.removeFromCurrent(item)

    if (this.isNewItem(item)) {
      this.removeFromNew(item)

      return
    }

    if (!this.isRemovedItem(item)) {
      this.removed.push(item)
    }
  }

  public update(items: T[]): void {
    const newItems = items.filter((newItem) => {
      return !this.getItems().some((currentItem) =>
        this.compareItems(newItem, currentItem),
      )
    })

    const removedItems = this.getItems().filter((currentItem) => {
      return !items.some((newItem) => this.compareItems(currentItem, newItem))
    })

    this.currentItems = items
    this.new = newItems
    this.removed = removedItems
  }
}

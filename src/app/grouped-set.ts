import { State, InitialState, Group, Action, Scroll, Toggle, Index, Initialize } from './model';

export function groupedSetStateFunc<T extends Group>(state: State<T>, action: Action<T>): State<T> {

  if (action instanceof Initialize) {
    return processInitialize(state, action.state);
  }

  if (action instanceof Scroll) {
    return processScroll(state, action.position);
  }

  if (action instanceof Toggle) {
    return processToggle(state, action.id);
  }

  // To support reusability
  return state;
}

function processInitialize<T extends Group>(_: State<T>, state: InitialState<T>): State<T> {
  const { allItems, headerHeight } = state;

  const keys = Object.keys(allItems);
  const expanded = [];
  const position = 0;
  const height = keys.length * headerHeight;
  const result: State<T> = { keys, expanded, position, height, ...state };

  return processScroll(result, position);
}

function processScroll<T extends Group>(state: State<T>, position: number): State<T> {
  const { height, headerHeight, itemHeight, containerHeight } = state;
  const from = position * height;
  const to = from + containerHeight;

  const start: Index = findIndex(state, 0, from, Math.floor);
  const end: Index = findIndex(state, start.groupPosition, to, Math.ceil);

  return Object.assign({}, state, {start, end, position});
}

function processToggle<T extends Group>(state: State<T>, id: string): State<T> {
  const { expanded, keys, itemHeight, allItems, height, containerHeight } = state;
  const index = expanded.indexOf(id);
  const found = index !== -1;

  const nextExpanded = found ? [expanded.slice(0, index), expanded.slice(index + 1)] : [id, ...expanded];
  const itemsHeight = allItems[id].count * itemHeight;

  const nextHeight = found ? height - itemsHeight : height + itemsHeight;
  const result: State<T> = Object.assign({}, state, {expanded: nextExpanded, height: nextHeight});

  result.end = findIndex(result, result.start.groupPosition, result.position + containerHeight, Math.ceil);
  return result;
}

function findIndex<T extends Group>(
  { keys, allItems, headerHeight, itemHeight, expanded }: State<T>,
  position: number, to: number, roundFunc: (number) => number, index: number = -1): Index {

  let key;
  let groupPosition = position;
  while (position <= to && index < (keys.length - 1)) {
    index++;
    groupPosition = position;
    key = keys[index];

    position += headerHeight;
    if (position <= to) {
      if (expanded.indexOf(key) !== -1) {
        position += allItems[key].count * itemHeight;
      }
    }
  }

  const capacity = expanded.indexOf(key) !== -1 ? Math.max(0, roundFunc((to - groupPosition - headerHeight) / itemHeight)) : 0;
  const shift = to > groupPosition ? to - (groupPosition + headerHeight + capacity * itemHeight) : 0;

  return {
    index,
    groupPosition,
    itemIndex: capacity - 1,
    shift
  };
}

// https://jsfiddle.net/u8100v8u/14/

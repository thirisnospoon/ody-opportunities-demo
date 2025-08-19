export const truncate = (str, max = 220) =>
    !str ? "" : str.length <= max ? str : `${str.slice(0, max - 1)}…`;

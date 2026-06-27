import { SSB_CENTERS } from './ssb_dorms.js';

export function listAllSelectionBoards() {
  return SSB_CENTERS.map(c => ({
    title: `${c.board} - ${c.city}`,
    code: c.code,
    dormSupport: true,
  }));
}

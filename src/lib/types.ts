export type Board = {
  id: string;
  owner_id: string;
  title: string;
  created_at: string;
};

export type Column = {
  id: string;
  board_id: string;
  title: string;
  position: number;
  created_at: string;
};

export type Card = {
  id: string;
  column_id: string;
  title: string;
  description: string;
  position: number;
  created_at: string;
};

export type ColumnWithCards = Column & { cards: Card[] };

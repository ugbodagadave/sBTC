// Event model
export interface Event {
  id: string;
  type: string;
  data: any;
  createdAt: Date;
}

export interface CreateEventInput {
  type: string;
  data: any;
}
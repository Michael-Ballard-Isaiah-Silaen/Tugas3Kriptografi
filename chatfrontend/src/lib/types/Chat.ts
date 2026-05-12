import {IUser} from "./User";

export interface Chat{
  _id: string;
  participants: IUser[];
}
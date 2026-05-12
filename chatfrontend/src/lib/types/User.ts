export interface IUser{
  _id: string;
  email: string;
  username: string;
}

export interface IUserForm{
  email?: string;
  password?: string;
  username?: string;
}
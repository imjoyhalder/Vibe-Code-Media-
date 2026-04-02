import { User } from "../modules/auth/auth.interfacet";


declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: User;
    }
  }
}

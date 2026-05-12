import {Outlet, createBrowserRouter} from "react-router-dom";
import HomePage from "../pages/HomePage/HomePage";
import Layout from "./Layout";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import IsLoggedIn from "./loaders/IsLoggedIn";
import {CurrentUserProvider} from "../lib/contexts/CurrentUserContext";
import ContactsPage from "../pages/ContactsPage/ContactsPage";
import ChatPage from "../pages/ChatPage/ChatPage";

const router = createBrowserRouter([
  {
    path: "/",
    element:(
      <CurrentUserProvider>
        <Layout />
      </CurrentUserProvider>
    ),
    children:[
      {
        path: "auth",
        element: <Outlet />,
        children:[
          {
            path: "sign-in",
            element: <LoginPage />,
          },
          {
            path: "sign-up",
            element: <RegisterPage />,
          },
        ],
      },
      {
        path: "",
        loader: IsLoggedIn,
        element: <Outlet />,
        children:[
          {
            path: "",
            element: <HomePage />,
          },
          {
            path: "contacts",
            element: <ContactsPage />,
          },
          {
            path: "chat/:chatId",
            element: <ChatPage />,
          },
        ],
      },
    ],
  },
]);

export default router;
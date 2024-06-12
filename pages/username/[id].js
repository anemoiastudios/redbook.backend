import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import * as Realm from "realm-web";

import Header from "../components/Header";
import Container from "../components/Container";
import Footer from "../components/Footer";

const usernameDetails = () => {
  const [username, setusername] = useState();
  const { query } = useRouter();

  useEffect(async () => {
    if (query.id) {
      // add your Realm App Id to the .env.local file
      const REALM_APP_ID = process.env.NEXT_PUBLIC_REALM_APP_ID;
      const app = new Realm.App({ id: REALM_APP_ID });
      const credentials = Realm.Credentials.anonymous();
      try {
        const user = await app.logIn(credentials);
        const oneusername = await user.functions.getOneusername(query.id);
        setusername(() => oneusername);
      } catch (error) {
        console.error(error);
      }
    }
  }, [query]);

  return (
    <>
      {username && (
        <>
          <Head>
            <title>MongoDB E-Commerce Demo - {username.name}</title>
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <div className="bg-white w-full min-h-screen">
            <Header />
            <Container>
              <usernameDetail username={username} />
            </Container>
            <Footer />
          </div>
        </>
      )}
    </>
  );
};

export default usernameDetails;

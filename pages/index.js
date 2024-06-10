import Head from "next/head";
import { useState, useEffect } from "react";
import * as Realm from "realm-web";
import Category from "../../../Desktop/jumpstart-series-atlas-search/jumpstart-series-atlas-search/components/Category";
import Container from "../../../Desktop/jumpstart-series-atlas-search/jumpstart-series-atlas-search/components/Container";
import Footer from "../../../Desktop/jumpstart-series-atlas-search/jumpstart-series-atlas-search/components/Footer";
import Header from "../../../Desktop/jumpstart-series-atlas-search/jumpstart-series-atlas-search/components/Header";
import Hero from "../../../Desktop/jumpstart-series-atlas-search/jumpstart-series-atlas-search/components/Hero";
import Pagination from "../../../Desktop/jumpstart-series-atlas-search/jumpstart-series-atlas-search/components/Pagination";
import Products from "../../../Desktop/jumpstart-series-atlas-search/jumpstart-series-atlas-search/components/Products";

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(async () => {
    const REALM_APP_ID = process.env.NEXT_PUBLIC_REALM_APP_ID;
    const app = new Realm.App({ id: REALM_APP_ID });
    const credentials = Realm.Credentials.anonymous();
    try {
      const user = await app.logIn(credentials);
      const allProducts = await user.functions.getAllProducts();
      setProducts(() => allProducts);
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="bg-white w-full min-h-screen">
        <Header />
        <Container>
          <Hero />
          <Category
            category="Tech Wear"
            categoryCount={`${products.length} Products`}
          />
          <Products products={products} />
          <Pagination />
        </Container>
        <Footer />
      </div>
    </div>
  );
}

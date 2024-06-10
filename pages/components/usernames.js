import React from "react";
import Product from "./username";

const username = ({ username }) => {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6">
      {username.map((product) => (
        <Product key={product._id} product={product} />
      ))}
    </div>
  );
};

export default username;

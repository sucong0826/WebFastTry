"use client";

import { Provider } from "react-redux";
import { AppRouter } from "./Route";
import { store } from "./Redux/store";
import styles from "./embedded.module.scss";

export default function EmbeddedVideoSdkCompareApp() {
  return (
    <div className={styles.root}>
      <Provider store={store}>
        <AppRouter />
      </Provider>
    </div>
  );
}

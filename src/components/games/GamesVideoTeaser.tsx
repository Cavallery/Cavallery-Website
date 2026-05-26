"use client";
import styles from "./GamesVideoTeaser.module.css";

export default function GamesVideoTeaser() {
  return (
    <div className={styles.videoWrap}>
      <video
        src="https://cava.jkt48connect.com/erine-game.mp4"
        autoPlay
        muted
        loop
        playsInline
        controls
        className={styles.video}
      />
    </div>
  );
}

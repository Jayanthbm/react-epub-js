import { IoArrowBack, IoArrowForward } from 'react-icons/io5';
import React from 'react';
import styles from './BottomBarStyles.module.css';

const BottomBar = (props) => {
  return (
    <div className={styles.parent} style={{ backgroundColor: props.bg }}>
      <div
        className={styles.menu}
        style={{
          justifyContent: props.scroll === true ? 'center' : 'space-between',
        }}
      >
        {props.scroll === false && (
          <IoArrowBack className={styles.icon} onClick={props.onPrev} />
        )}
        <p style={{ alignSelf: 'center' }}>
          {props.page.percentage}{' '}
          {props.page.percentage === 'the end' ? '' : '%'}
        </p>
        {props.scroll === false && (
          <IoArrowForward className={styles.icon} onClick={props.onNext} />
        )}
      </div>
    </div>
  );
};
export default BottomBar;

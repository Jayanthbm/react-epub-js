import React, { useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ReactReader, ReactReaderStyle } from 'react-reader';
import { IoArrowBack, IoArrowForward } from 'react-icons/io5';
import 'react-responsive-modal/styles.css';
import useWindowDimensions from '../hooks/useWindowDimensions';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const loc = null;
const ownStyles = {
  ...ReactReaderStyle,
  arrow: {
    display: 'none',
  },
};
const Reader = () => {
  const { height } = useWindowDimensions();
  const [tmpUrl, setTmpUrl] = useState('');
  const [selections, setSelections] = useState([]);
  const renditionRef = useRef(null);
  const tocRef = useRef(null);
  let query = useQuery();
  const [URL, setURL] = useState(query.get('url'));

  const [location, setLocation] = useState(loc);

  const [page, setPage] = useState('');
  const locationChanged = (epubcifi) => {
    try {
      setLocation(epubcifi);
      const { displayed, href } = renditionRef.current.location.start;
      const chapter = tocRef.current.find((item) => item.href === href);
      setPage(
        `Page ${displayed.page} of ${displayed.total} ${
          chapter ? 'in chapter' + chapter.label : ''
        }`
      );
    } catch (error) {}
  };

  const [size, setSize] = useState(100);
  const changeSize = (newSize) => {
    setSize(newSize);
  };

  useEffect(() => {
    try {
      if (renditionRef.current) {
        renditionRef.current.themes.fontSize(`${size}%`);
      }
    } catch (error) {}
  }, [size]);

  const [backgroundColor, setBackgroundColor] = useState('#fff');
  const [textColor, setTextColor] = useState('#000');
  useEffect(() => {
    try {
      if (renditionRef.current) {
        renditionRef.current.themes.register('theme', {
          body: {
            color: textColor,
            background: backgroundColor,
          },
        });
        renditionRef.current.themes.select('theme');
      }
    } catch (error) {}
  }, [backgroundColor, textColor]);

  const [selectedText, setSelectedText] = useState('');
  useEffect(() => {
    if (renditionRef.current) {
      function setRenderSelection(cfiRange, contents) {
        let text = renditionRef.current.getRange(cfiRange).toString();
        setSelectedText(text);
        setSelections(
          selections.concat({
            text: renditionRef.current.getRange(cfiRange).toString(),
            cfiRange,
          })
        );
      }
      renditionRef.current.on('selected', setRenderSelection);

      if (selectedText) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({ type: 'selected', text: selectedText })
          );
        }
      }
      return () => {
        renditionRef.current.off('selected', setRenderSelection);
      };
    }
  }, [setSelections, selections, selectedText]);

  return (
    <React.Fragment>
      <div style={{ background: backgroundColor }}>
        {URL === 'null' || URL === null ? (
          <div>
            <input
              value={tmpUrl}
              onChange={(e) => {
                setTmpUrl(e.target.value);
              }}
            />
            <button onClick={() => setURL(tmpUrl)}>Submit</button>
          </div>
        ) : (
          <div
            className='App'
            style={{
              position: 'relative',
              height: height - 150,
              background: backgroundColor,
            }}
          >
            <ReactReader
              location={location}
              locationChanged={locationChanged}
              url={URL}
              styles={ownStyles}
              showToc={true}
              getRendition={(rendition) => {
                renditionRef.current = rendition;
                renditionRef.current.themes.fontSize(`${size}%`);
                renditionRef.current.themes.register('theme', {
                  body: {
                    color: textColor,
                    background: backgroundColor,
                  },
                });
                renditionRef.current.themes.select('theme');
                setSelections([]);
              }}
              tocChanged={(toc) => (tocRef.current = toc)}
            />
            <div
              style={{
                marginTop: -5,
                textAlign: 'center',
                zIndex: 1,
                background: backgroundColor,
              }}
            >
              <hr />
              <button
                onClick={() => changeSize(Math.max(80, size - 10))}
                style={{
                  paddingLeft: 20,
                  paddingRight: 20,
                  paddingTop: 2,
                  paddingBottom: 2,
                  marginRight: 20,
                }}
                disabled={size <= 80 ? true : false}
              >
                <span
                  style={{ color: size <= 80 ? '#ccc' : 'blue', fontSize: 20 }}
                >
                  -
                </span>
              </button>

              <span
                style={{
                  borderColor: '#ccc',
                  borderStyle: 'solid',
                  paddingLeft: 30,
                  paddingRight: 30,
                  paddingTop: 5,
                  paddingBottom: 5,
                  color: textColor,
                }}
              >
                Text Size
              </span>
              <button
                onClick={() => changeSize(Math.min(200, size + 10))}
                style={{
                  paddingLeft: 20,
                  paddingRight: 20,
                  paddingTop: 2,
                  paddingBottom: 2,
                  marginLeft: 20,
                  marginBottom: 10,
                }}
                disabled={size >= 200 ? true : false}
              >
                <span
                  style={{ color: size >= 200 ? '#ccc' : 'blue', fontSize: 20 }}
                >
                  +
                </span>
              </button>
              <br />
              <button
                onClick={() => renditionRef.current.prev()}
                style={{
                  paddingLeft: 20,
                  paddingRight: 20,
                  paddingTop: 2,
                  paddingBottom: 2,
                  marginLeft: 20,
                  marginBottom: 10,
                }}
              >
                <IoArrowBack />
              </button>
              <button
                onClick={() => renditionRef.current.next()}
                style={{
                  paddingLeft: 20,
                  paddingRight: 20,
                  paddingTop: 2,
                  paddingBottom: 2,
                  marginLeft: 20,
                  marginBottom: 10,
                }}
              >
                <IoArrowForward />
              </button>
              <br />
              <button
                style={{
                  paddingLeft: 20,
                  paddingRight: 20,
                  paddingTop: 2,
                  paddingBottom: 2,
                  marginLeft: 20,
                  marginBottom: 10,
                  background: '#fff',
                }}
                onClick={() => {
                  setBackgroundColor('#fff');
                  setTextColor('#000');
                }}
                disabled={false}
              >
                <span
                  style={{
                    textAlign: 'center',
                    fontWeight: 'bolder',
                    color: '#000',
                    fontSize: 18,
                  }}
                >
                  Aa
                </span>
              </button>
              <button
                style={{
                  paddingLeft: 20,
                  paddingRight: 20,
                  paddingTop: 2,
                  paddingBottom: 2,
                  marginLeft: 20,
                  marginBottom: 10,
                  background: '#ccc',
                }}
                onClick={() => {
                  setBackgroundColor('#ccc');
                  setTextColor('#000');
                }}
                disabled={false}
              >
                <span
                  style={{
                    textAlign: 'center',
                    fontWeight: 'bolder',
                    color: '#000',
                    fontSize: 18,
                  }}
                >
                  Aa
                </span>
              </button>
              <button
                style={{
                  paddingLeft: 20,
                  paddingRight: 20,
                  paddingTop: 2,
                  paddingBottom: 2,
                  marginLeft: 20,
                  marginBottom: 10,
                  background: '#000',
                }}
                onClick={() => {
                  setBackgroundColor('#000');
                  setTextColor('#fff');
                }}
                disabled={false}
              >
                <span
                  style={{
                    textAlign: 'center',
                    fontWeight: 'bolder',
                    color: '#fff',
                    fontSize: 18,
                  }}
                >
                  Aa
                </span>
              </button>
              <br />
              <span style={{ color: textColor }}>{page}</span>
            </div>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

export default Reader;

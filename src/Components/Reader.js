import React, { useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ReactReader, ReactReaderStyle } from 'react-reader';
import { IoArrowBack, IoArrowForward } from 'react-icons/io5';
import { IoVolumeOff } from 'react-icons/io5';
import { MdTranslate } from 'react-icons/md';
import { VscSaveAs } from 'react-icons/vsc';
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';
import axios from 'axios';
import Loader from 'react-loader-spinner';
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import useWindowDimensions from '../hooks/useWindowDimensions';
import Speech from 'speak-tts';
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
const SINGLE_WORD = 'http://18.216.248.41/api/v1/word/single/words';
const Reader = () => {
  const { width, height } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const onOpenModal = () => setOpen(true);
  const onCloseModal = () => setOpen(false);
  const [modalLoader, setModalLoader] = useState(false);
  const [tmpUrl, setTmpUrl] = useState('');
  const [selections, setSelections] = useState([]);
  const renditionRef = useRef(null);
  const tocRef = useRef(null);
  let query = useQuery();
  const [URL, setURL] = useState(query.get('url'));
  const TOKEN = query.get('token');
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
  const [isOneWord, setIsOneWord] = useState(false);
  const [oneWordData, setOneWOrdData] = useState(null);
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
        if (selectedText.length > 0 && selectedText.length < 130) {
          let spaceCount = selectedText.trim().split(' ').length - 1;
          if (spaceCount === 0) {
            setIsOneWord(true);
            setModalLoader(true);
          } else {
            setIsOneWord(false);
            setModalLoader(false);
          }
        }
        setTimeout(() => {
          onOpenModal();
        }, 2000);
      }

      return () => {
        renditionRef.current.off('selected', setRenderSelection);
      };
    }
  }, [setSelections, selections, selectedText]);

  useEffect(() => {
    async function SingleWord() {
      try {
        if (TOKEN) {
          setModalLoader(true);
          var data = JSON.stringify({
            word: selectedText,
          });
          var config = {
            method: 'post',
            url: SINGLE_WORD,
            headers: {
              Authorization: `Bearer ${TOKEN}`,
              'Content-Type': 'application/json',
            },
            data: data,
          };
          axios(config)
            .then(function (response) {
              setOneWOrdData(response.data);
              setModalLoader(false);
            })
            .catch(function (error) {
              console.log(error);
              setModalLoader(false);
            });
        }
        setModalLoader(true);
      } catch (error) {}
    }
    if (isOneWord) {
      SingleWord();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOneWord]);

  const speech = new Speech();
  useEffect(() => {
    speech
      .init({
        volume: 0.5,
        lang: 'en-GB',
        rate: 1,
        pitch: 1,
      })
      .then((data) => {})
      .catch((e) => {
        console.error('An error occured while initializing : ', e);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const TexttoSpeech = async () => {
    let text = selectedText;
    speech
      .speak({
        text,
        queue: false,
        listeners: {
          onstart: () => {},
          onend: () => {},
          onresume: () => {},
        },
      })
      .then((data) => {})
      .catch((e) => {});
  };

  const [translatedText, setTranslatedText] = useState('');
  const TranslateText = async (text) => {
    setModalLoader(true);
    setTimeout(() => {
      setModalLoader(false);
      setTranslatedText('कल्पना');
    }, 2000);
    return true;
  };

  const AddtoPhrase = async (text) => {
    setModalLoader(true);
    setTimeout(() => {
      setModalLoader(false);
    }, 2000);
    return true;
  };

  function OneWordData(props) {
    return (
      <div
        style={{
          borderStyle: 'solid',
          borderWidth: 0.2,
          borderColor: '#ccc',
          paddingLeft: 20,
          paddingRight: 20,
          paddingTop: 5,
          paddingBottom: 5,
        }}
      >
        <div style={{ marginBottom: 5 }}>
          <span style={{ fontWeight: '500', color: '#989AA0', marginRight: 5 }}>
            Pos:
          </span>
          <span style={{ color: '#000', fontWeight: 'bold' }}>
            {props.data.pos}
          </span>
        </div>
        <div style={{ marginBottom: 5 }}>
          <span style={{ fontWeight: '500', color: '#989AA0', marginRight: 5 }}>
            Translation:
          </span>
          <span style={{ color: '#000', fontWeight: 'bold' }}>
            {props.data.translation}
          </span>
        </div>
        <div>
          {props.data.meanings.map((meaning, index) => (
            <div key={index}>
              <div style={{ marginBottom: 5 }}>
                <span
                  style={{
                    fontWeight: '500',
                    color: '#989AA0',
                    marginRight: 5,
                  }}
                >
                  Meaning:
                </span>
                <span>{meaning.meanings}</span>
              </div>
              <div style={{ marginBottom: 5 }}>
                <span
                  style={{
                    fontWeight: '500',
                    color: '#989AA0',
                    marginRight: 5,
                  }}
                >
                  Usage:
                </span>
                <span>{meaning.sentence_usage}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'test', message: 'Helo World' })
      );
    }
  }, []);
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
      {/* <Modal
        open={open}
        center
        onClose={() => {
          onCloseModal();
          setSelectedText('');
          setIsOneWord(false);
          setOneWOrdData(null);
          setTranslatedText('');
        }}
      >
        <div style={{ flex: 1, width: width / 1.5 }}>
          <div
            style={{
              marginLeft: 'auto',
              marginRight: 'auto',
              width: '20%',
            }}
          >
            <Loader
              type='Circles'
              color='#00BFFF'
              height={30}
              width={30}
              visible={modalLoader}
            />
          </div>
          <div>
            <span
              style={{
                fontWeight: '500',
                color: '#989AA0',
                display: 'block',
              }}
            >
              Selected Text
            </span>
            <span style={{ display: 'block', marginTop: 10, marginBottom: 10 }}>
              {selectedText}
            </span>
            <div style={{ flexDirection: 'row' }}>
              <IoVolumeOff
                style={{
                  fontSize: 30,
                  marginInlineEnd: 10,
                  cursor: 'pointer',
                }}
                onClick={TexttoSpeech}
              />
              <MdTranslate
                style={{
                  fontSize: 30,
                  marginInlineEnd: 10,
                  cursor: 'pointer',
                }}
                onClick={TranslateText}
              />
              <VscSaveAs
                style={{
                  fontSize: 30,
                  marginInlineEnd: 10,
                  cursor: 'pointer',
                }}
                onClick={AddtoPhrase}
              />
            </div>
            <br />
            {translatedText && translatedText.length > 1 && (
              <div>
                <span
                  style={{
                    fontWeight: '500',
                    color: '#989AA0',
                    marginRight: 5,
                  }}
                >
                  Translation:
                </span>
                <span style={{ color: '#000', fontWeight: 'bold' }}>
                  {translatedText}
                </span>
              </div>
            )}
            {oneWordData && (
              <React.Fragment>
                {oneWordData.map((_data) => {
                  return <OneWordData key={Math.random(1000)} data={_data} />;
                })}
              </React.Fragment>
            )}
          </div>
        </div>
      </Modal> */}
    </React.Fragment>
  );
};

export default Reader;

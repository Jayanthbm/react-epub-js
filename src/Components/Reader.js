import React, { useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ReactReader, ReactReaderStyle } from 'react-reader';
import { IoArrowBack, IoArrowForward } from 'react-icons/io5';
import { IoVolumeOff } from 'react-icons/io5';
import { MdTranslate } from 'react-icons/md';
import { VscSaveAs } from 'react-icons/vsc';

import { Modal } from 'react-responsive-modal';
import axios from 'axios';
import '../../node_modules/react-responsive-modal/styles.css';
import Loader from 'react-loader-spinner';
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
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
const SINGLE_WORD = 'http://18.216.248.41/api/v1/word/single/words';
const Reader = () => {
  const { width } = useWindowDimensions();
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

  // eslint-disable-next-line no-unused-vars
  const [darkmode, setDarkmode] = useState(false);

  useEffect(() => {
    try {
      if (renditionRef.current) {
        renditionRef.current.themes.register('theme', {
          body: {
            color: darkmode ? '#fff' : '#000',
            background: darkmode ? '#000' : '#fff',
          },
        });
        renditionRef.current.themes.select('theme');
      }
    } catch (error) {}
  }, [darkmode]);

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
      if (selectedText.length > 0) {
        if (selectedText.length < 130) {
          let spaceCount = selectedText.split(' ').length - 1;
          if (spaceCount === 0) {
            setIsOneWord(true);
            setModalLoader(true);
          } else {
            setIsOneWord(false);
            setModalLoader(false);
          }
          setTimeout(() => {
            setShowModal(true);
          }, 2000);
        }
      }
      return () => {
        renditionRef.current.off('selected', setRenderSelection);
      };
    }
  }, [setSelections, selections, selectedText]);
  const [showModal, setShowModal] = useState(false);
  const [modalLoader, setModalLoader] = useState(false);
  useEffect(() => {
    async function SingleWord() {
      console.log(TOKEN);
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
              console.log(response.data);
              setOneWOrdData(response.data);
              setModalLoader(false);
            })
            .catch(function (error) {
              console.log(error);
            });
        }
      } catch (error) {}
    }
    if (isOneWord) {
      SingleWord();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOneWord]);

  const TexttoSpeech = async (text) => {
    return true;
  };

  const TranslateText = async (text) => {
    return true;
  };

  const AddtoPhrase = async (text) => {
    return true;
  };
  return (
    <React.Fragment>
      <div style={{ background: darkmode ? '#000' : '#fff' }}>
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
              height: '100vh',
              background: darkmode ? '#000' : '#fff',
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
                    color: darkmode ? '#fff' : '#000',
                    background: darkmode ? '#000' : '#fff',
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
                background: darkmode ? '#000' : '#fff',
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
                  color: darkmode ? '#fff' : '#000',
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
                {' '}
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
                {' '}
                <IoArrowForward />
              </button>
              <br />
              <span>{page}</span>
            </div>
          </div>
        )}
      </div>
      <div>
        <Modal
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedText('');
          }}
          center={true}
        >
          <div style={{ flex: 1, width: width / 1.5 }}>
            <div
              style={{ marginLeft: 'auto', marginRight: 'auto', width: '20%' }}
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
              <span
                style={{ display: 'block', marginTop: 10, marginBottom: 10 }}
              >
                {selectedText}
              </span>
              <div style={{ flexDirection: 'row' }}>
                <IoVolumeOff
                  style={{ fontSize: 30, marginInlineEnd: 10 }}
                  onClick={TexttoSpeech}
                />
                <MdTranslate
                  style={{ fontSize: 30, marginInlineEnd: 10 }}
                  onClick={TranslateText}
                />
                <VscSaveAs
                  style={{ fontSize: 30, marginInlineEnd: 10 }}
                  onClick={AddtoPhrase}
                />
              </div>
              {oneWordData && <div> One Word Data</div>}
            </div>
          </div>
        </Modal>
      </div>
    </React.Fragment>
  );
};

export default Reader;

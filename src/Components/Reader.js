import React, { useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ReactEpubViewer } from 'react-epub-viewer';
import BottomBar from './BottomBar/BottomBar';
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Reader = () => {
  const [tmpUrl, setTmpUrl] = useState('');
  let query = useQuery();
  const [URL, setURL] = useState(query.get('url'));
  const viewerRef = useRef(null);
  const rendiRef = useRef(null);
  const [rendition, setRendition] = useState(null);
  const [scroll, setScroll] = useState(false);
  const [page, setPage] = useState({
    current: 0,
    total: 0,
    cfi: '',
    percentage: 0,
  });
  const [config, setConfig] = useState({
    fontSize: 16,
    color: '',
    bg: '',
  });
  const [load, setLoad] = useState(false);
  useEffect(() => {
    const disableContextMenu = () => {
      let iframeBody = document.getElementsByTagName('iframe');
      for (var i = 0, len = iframeBody.length; i < len; i++) {
        var taskItem = iframeBody[i];
        taskItem.contentWindow &&
          taskItem.contentWindow.addEventListener(
            'contextmenu',
            // eslint-disable-next-line no-loop-func
            function (e) {
              e.preventDefault();
              e.stopPropagation();
            },
            false
          );
      }
    };
    if (load === false) {
      disableContextMenu();
    }
    // eslint-disable-next-line
  }, [load]);

  useEffect(() => {
    if (rendiRef.current) {
      if (scroll === true) {
        rendiRef.current.flow('scrolled');
      } else {
        rendiRef.current.flow('paginated');
      }
    }
    // eslint-disable-next-line
  }, [scroll]);

  useEffect(() => {
    if (rendiRef.current) {
      rendiRef.current.themes.fontSize(config.fontSize + 'px');
      rendiRef.current.manager.clear();
      rendiRef.current.display(page.cfi);
    }
    // eslint-disable-next-line
  }, [config.fontSize]);

  useEffect(() => {
    if (rendiRef.current) {
      const windy = window;
      rendiRef.current.themes.default({
        body: { color: config.color },
      });
      const background = {
        type: 'BACKGROUND',
        value: config.bg,
      };
      windy.ReactNativeWebView &&
        windy.ReactNativeWebView.postMessage(JSON.stringify(background));
    }
    // eslint-disable-next-line
  }, [config]);

  const [lists, setLists] = useState({
    annotations: [], // BOOKMARKS + ANNOTATIONS,
    search: [],
  });

  const [bookmarkedPages, setBookmarkedPages] = useState([]);
  useEffect(() => {
    if (lists.annotations) {
      let list = [];

      lists.annotations?.map((item, index) => {
        if (item.type === 'BOOKMARK') {
          list.push(parseInt(item.pageNumber));
        }
        return true;
      });
      setBookmarkedPages(list);
    }
  }, [lists.annotations]);

  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [show, setShow] = useState({
    search: false,
    annotation: false,
    config: false,
    scroll: false,
    toc: false,
    popup: false,
    nightMode: false,
  });
  const annRef = useRef(lists.annotations);
  const [cfi, setCfi] = useState({
    range: '',
    page: '',
  });
  const [marked, setMarked] = useState(false);
  const [sharedData, setShared] = useState({
    token: '',
    paper: '',
    annotation: '',
  });
  useEffect(() => {
    const getPosition = () => {
      var posy = 0;
      let posx = 0;
      let selection;
      let iframeBody = document.getElementsByTagName('iframe');
      for (var i = 0, len = iframeBody.length; i < len; i++) {
        var doc = iframeBody[i]?.contentWindow?.document;
        const sel = doc?.getSelection();
        if (sel.type === 'None') continue;
        selection = sel;
      }
      if (selection) {
        let range = selection.getRangeAt(0).cloneRange();
        if (!range.getClientRects) return;
        posy = range.getClientRects().item(0).y;
        posx = range.getClientRects().item(0).x;
        if (
          selection?.toString().length === 0 ||
          selection?.toString().replace(/\s/g, '').length === 0
        )
          return;

        let x = posx > window.innerWidth ? posx % window.innerWidth : posx;
        let y = posy > window.innerHeight ? posy % window.innerHeight : posy;
        setX(x);
        setY(y + 30);
        handleShow('popup', true);
      }
    };

    const handleShow = (key, value) => {
      let x = { ...show };
      if (key === 'popup') {
        x['annotation'] = false;
      }
      x[key] = value;

      setShow(x);
    };

    const handleMarked = (cfiRange, rendi, list) => {
      // check if same chapter
      // check if same pathComponent
      // check if cfiRange is within item.epubcfi
      let chapt1 = rendi.epubcfi.getChapterComponent(cfiRange);
      let path1 = rendi.epubcfi.getPathComponent(cfiRange);
      let range1 = rendi.epubcfi.getRange(cfiRange);
      let x = [...list];
      let _cfi = null;
      x.map((item, index) => {
        let chapt2 = rendi.epubcfi.getChapterComponent(item.epubCfi);
        let path2 = rendi.epubcfi.getPathComponent(item.epubCfi);
        let range2 = rendi.epubcfi.getRange(item.epubCfi);
        console.log(
          'ranges',
          cfiRange,
          item.epubCfi,
          rendi.epubcfi.parseComponent(cfiRange),
          rendi.epubcfi.parseComponent(item.epubCfi),
          path1,
          path2,
          range1,
          range2
        );
        // if (
        //  chapt1 === chapt2
        // ) {
        //   setMarked(true);
        //   _cfi = item.epubCfi;
        //   item.note && setNote(item.note);
        // }
      });
      return _cfi;
      // let x: Array<any> = [...lists.annotations];
      // let inde = x.findIndex((item) => {
      //   if (item.type === "HIGHLIGHT") {
      //     if (item.epubCfi === _cfi) return true;
      //   } else {
      //     return false;
      //   }
      // });
      // if (inde !== -1) {
      //   x[inde].note && setNote(x[inde].note);
      // }
    };
    const handleCFI = (key, value) => {
      let x = { ...cfi };
      x[key] = value;

      setCfi(x);
    };
    const setAnnotations = (token, paper, rendi) => {
      // services
      //   .getAnn(token, paper)
      //   .then((response) => {
      //     // alert(
      //     //   `ann fetch - ${response.status} = ${response.data} - ${response}`
      //     // );
      //     const annData = response.data.ann;
      //     let data: any = [];
      //     annData.map((item: any, index: number) => {
      //       delete item._id;
      //       data.push(item);
      //       return true;
      //     });
      //     setShared({
      //       token: token,
      //       paper: paper,
      //       annotation: response.data._id,
      //     });
      //     setAnn(data);
      //     data.map((item: any, index: number) => {
      //       showAnn(item.epubCfi, item.text, item.color, rendi);
      //       return true;
      //     });
      //   })
      //   .catch((error) => alert(`ann fetch error - ${error}`));
    };
    if (rendiRef.current) {
      rendiRef.current.on('selected', (cfiRange, content) => {
        getPosition();
        let newCfi = handleMarked(cfiRange, rendiRef.current, annRef.current);
        if (newCfi !== null) {
          handleCFI('range', newCfi);
        } else {
          handleCFI('range', cfiRange);
        }
        content.window.getSelection().removeAllRanges();
      });

      rendiRef.current.on('relocated', function (location) {
        // var percent = book.locations.percentageFromCfi(location.start.cfi);

        let current = location.start.displayed.page;
        let total = location.end.displayed.total;
        var percentage = Math.floor((current / total) * 100);
        setPage({
          current:
            location.atEnd === true
              ? location.end.displayed.page
              : location.start.displayed.page,
          total: location.end.displayed.total,
          cfi: location.start.cfi,
          percentage: location.atEnd === true ? 'the end' : percentage,
        });
      });

      rendiRef.current.on('markClicked', (_cfi, data, content) => {
        let selection = content.document.getSelection();
        let range = selection.getRangeAt(0).cloneRange();
        if (!range.getClientRects) return;
        let posy = range.getClientRects().item(0).y;
        let posx = range.getClientRects().item(0).x;
        setMarked(true);
        handleCFI('range', _cfi);
        let x = posx > window.innerWidth ? posx % window.innerWidth : posx;
        setX(x);
        setY(posy + 30);
        handleShow('popup', true);
      });

      if (window.URI && window.token && window.paper) {
        setShared({
          token: window.token,
          paper: window.paper,
          annotation: '',
        });
        setAnnotations(window.token, window.paper, rendiRef.current);
      }
    }
  }, [rendiRef.current]);

  // useEffect(() => {
  //   setTimeout(() => {
  //     if (window.URI && window.token && window.paper) {
  //       setUrl(window.URI);
  //     }
  //   }, 300);
  // }, []);

  return (
    <React.Fragment>
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
        <div>
          <ReactEpubViewer
            url={URL}
            ref={viewerRef}
            style={{ height: '85vh', marginTop: '6vh' }}
            epubOptions={{
              resizeOnOrientationChange: true,
              spread: 'auto',
              flow: 'paginated',
            }}
            rendtionChanged={(rendition) => {
              console.log('rendi', rendition);
              rendiRef.current = rendition;
              setRendition(rendition);
            }}
          />
          <BottomBar
            onNext={() => rendiRef.current && rendiRef.current.next()}
            onPrev={() => rendiRef.current && rendiRef.current.prev()}
            page={{
              current: page.current,
              total: page.total,
              percentage: page.percentage,
            }}
            scroll={scroll}
          />
        </div>
      )}
    </React.Fragment>
  );
};
export default Reader;

import "./style";
import styled from "styled-components";
import {
  Fab,
  FormControl,
  Select,
  MenuItem,
  AppBar,
  Typography,
  Grid,
  Toolbar,
} from "@material-ui/core";
import { PlayCircleFilled, PauseCircleFilled, ControlCameraOutlined } from "@material-ui/icons";
import { Fragment } from "preact";
import { useEffect, useState } from "preact/hooks";
import { bibleData } from "./data";
import localforage from "localforage";

export default function App() {
  return (
    <Fragment>
      <AppBar position="sticky">
        <Typography variant="h3" align="center">
          พระคัมภีร์
        </Typography>
      </AppBar>
      <Toolbar />
      <MusicPlayer />
    </Fragment>
  );
}

const BigFab = styled(Fab)`
  width: 30vh;
  height: 30vh;
  padding: 40px;
`;

const BigPlay = styled(PlayCircleFilled)`
  width: 20vh;
  height: 20vh;
`;

const BigPause = styled(PauseCircleFilled)`
  width: 20vh;
  height: 20vh;
`;

const intToString = (i) => {
  return i < 10 ? "0" + i : i;
};

export const toUrl = (book, chapter) => {
  return (
    "/assets/audios/B" +
    intToString(book + 1) +
    "___" +
    intToString(chapter) +
    ".mp3?raw=true"
  );
};

const books = Object.keys(bibleData);

const ensureMP3 = async () => {
  localforage
    .keys()
    .then(function (keys) {
      for (var book in bibleData) {
		  var chapter = 1;
        for (chapter in Array.from({ length: bibleData[book] })) {
          var url = toUrl(books.indexOf(book), chapter + 1);
		  console.log("Checking url: " + url);
		  if (!keys.includes(url)){
			console.log("Adding url: " + url);
			fetch(url, {mode: 'no-cors'})
				.then(response => response.blob())
				.then((blob) => {
					localforage.setItem(url, blob).then((value) => {console.log(value)}).catch((e) => {console.log(e)})
					console.log(blob);
				}).catch((e) => {console.log(e)});
        }
      }}
      console.log(keys);
    })
    .catch(function (err) {
      // This code runs if there were any errors
      console.log(err);
    });
};

const MusicPlayer = () => {
  const [book, setBook] = useState(books[0]);
  const [chapter, setChapter] = useState(1);
  const [maxChapter, setMaxChapter] = useState(bibleData[book]);
  const [isPlaying, setPlaying] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const bookIndex = () => {
    return books.indexOf(book);
  };
  const [audio] = useState(new Audio(toUrl(bookIndex(), chapter), {crossorigin: "anonymous"}));

  const onEnded = (e) => {
    if (bookIndex() < books.length - 1) {
      setBook(books[bookIndex() + 1]);
    } else {
      setPlaying(false);
      audio.pause();
      setBook(books[0]);
      setChapter(1);
    }
  };
  audio.onended = onEnded;

  useEffect(() => {
    isPlaying ? audio.play() : audio.pause();
  }, [isPlaying]);

  useEffect(() => {
    audio.pause();
    audio.src = toUrl(books.indexOf(book), chapter);
    if (isPlaying) {
      audio.play();
    }
  }, [book, chapter]);

  useEffect(() => {
    localforage
      .getItem("book")
      .then(function (value) {
        setBook(value);
      })
      .then(function (v) {
        return localforage.getItem("chapter");
      })
      .then(function (value) {
        setChapter(value);
      })
      .then(function (v) {
        setInitialized(true);
      })
      .catch(function (err) {
        console.log(err);
      });
  }, []);

  const onBook = (e) => {
    if (e.target.value == book) return;
    setBook(e.target.value);
  };
  useEffect(() => {
    setMaxChapter(bibleData[book]);
    if (initialized) {
      setChapter(1);
    }
  }, [book]);
  const onChapter = (e) => {
    setChapter(e.target.value);
  };
  const onPlayClick = (e) => {
    setPlaying(!isPlaying);
  };

  useEffect(() => {
    if (initialized) {
      localforage
        .setItem("book", book)
        .then(function (value) {})
        .catch(function (err) {
          console.log(err);
        });
      localforage
        .setItem("chapter", chapter)
        .then(function (value) {})
        .catch(function (err) {
          console.log(err);
        });
    }
  }, [book, chapter]);

  return (
    <Fragment>
      <Grid
        container
        direction="column"
        justify="space-around"
        alignItems="center"
        style={{ height: "80vh" }}
      >
        <Grid
          container
          direction="row"
          justify="space-evenly"
          alignItems="center"
        >
          <FormControl variant="outlined">
            <Select
              labelId="book-select-label"
              id="book-select"
              value={book}
              onChange={onBook}
            >
              {books.map((el, index) => {
                return (
                  <MenuItem key={index} value={el}>
                    <Typography variant="h5" align="center">
                      {el}
                    </Typography>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <FormControl variant="outlined">
            <Select
              labelId="chapter-select-label"
              id="chapter-select"
              value={chapter}
              onChange={onChapter}
            >
              {Array.from({ length: maxChapter }, (v, k) => k + 1).map(
                (el, index) => {
                  return (
                    <MenuItem key={index} value={el}>
                      <Typography variant="h5" align="center">
                        {el}
                      </Typography>
                    </MenuItem>
                  );
                }
              )}
            </Select>
          </FormControl>
        </Grid>
        <Grid flex="2" justifyContent="center">
          <BigFab color="primary" onClick={onPlayClick}>
            {isPlaying ? <BigPause /> : <BigPlay />}
          </BigFab>
        </Grid>
      </Grid>
    </Fragment>
  );
};

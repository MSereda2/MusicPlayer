import React from "react";
import QueuedSongList from "./QueuedSongList";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import {Pause, PlayArrow, SkipNext, SkipPrevious} from "@material-ui/icons";
import Slider from "@material-ui/core/Slider";
import CardMedia from "@material-ui/core/CardMedia";
import {makeStyles} from "@material-ui/core/styles";
import {SongContext} from "../App";
import {useQuery} from "@apollo/react-hooks";
import {GET_QUEUED_SONGS} from "../graphql/queries";
import ReactPlayer from "react-player";

const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    details: {
        display: 'flex',
        flexDirection: 'column',
        padding: '0px 15px'
    },
    content: {
        flex: '1 0 auton'
    },
    thumbnail: {
        width: 150
    },
    controls: {
        display: 'flex',
        alignItems: 'center',
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1)
    },
    playIcon: {
        height: 38,
        width: 38
    }

}));


const SongPlayer = () => {
    const { data, loading, error } = useQuery(GET_QUEUED_SONGS);
    const { state, dispatch } = React.useContext(SongContext);
    const classes = useStyles();
    const [played, setPlayed] = React.useState(0);
    const [seeking, setSeeking] = React.useState(false);
    const [playSeconds, setPlayedSeconds] = React.useState(0);
    const [positionInQueue, setPositionInQueue] = React.useState(0);
    const reactPlayerRef = React.useRef();

    React.useEffect(() => {
       const songIndex = data.queue.findIndex(song => song.id === state.song.id);
       setPositionInQueue(songIndex)
    }, [data.queue,state.song.id]);

    React.useEffect(() => {
        const nextSong = data.queue[positionInQueue + 1];
        if(played >= .99 && nextSong) {
            setPlayed(0);
            dispatch({ type: "SET_SONG", payload: { song: nextSong } })
        }
    }, [data.queue, played, dispatch, positionInQueue])

    const handleTogglePlay = () => {
        dispatch( state.isPlaying ? { type: "PAUSE_SONG" } : { type: "PLAY_SONG" });
    };

    const handleSliderChange = (e, newValue) => {
        setPlayed(newValue);
    }

    const handleSeekMouseDown = () => {
        setSeeking(true);
    }

    const handleSeekMouseUp = () => {
        setSeeking(false);
        reactPlayerRef.current.seekTo(played);
    }

    const formatDuration = (seconds) => {
        return new Date(seconds * 1000).toISOString().substr(11, 8)
    }

    const handlePlayPrevSong = () => {
        const prevSong = data.queue[positionInQueue - 1];
        if(prevSong) {
            dispatch({ type: 'SET_SONG', payload: { song: prevSong } })
        }

    };

    const handlePlayNextSong = () => {
        const nextSong = data.queue[positionInQueue + 1];
        if(nextSong) {
            dispatch({ type: 'SET_SONG', payload: { song: nextSong } })
        }
    }

    return (
        <>
            <Card variant={"outlined"} className={classes.container}>
                <div className={classes.details}>
                    <CardContent className={classes.content}>
                        <Typography variant={"h5"} component={"h3"}>
                            {state.song.title}
                        </Typography>
                        <Typography variant={"subtitle1"} component={"p"} color={"textSecondary"}>
                            {state.song.artist}
                        </Typography>
                    </CardContent>
                    <div className={classes.controls}>
                        <IconButton onClick={handlePlayPrevSong}>
                            <SkipPrevious/>
                        </IconButton>
                        <IconButton onClick={handleTogglePlay}>
                            { state.isPlaying ? <Pause className={classes.playIcon}/> : <PlayArrow className={classes.playIcon}/> }
                        </IconButton>
                        <IconButton onClick={handlePlayNextSong}>
                            <SkipNext/>
                        </IconButton>
                        <Typography variant={"subtitle1"} component={"p"} color={"textSecondary"}>
                            {formatDuration(playSeconds)}
                        </Typography>
                    </div>
                    <Slider
                        type={"range"}
                        value={played}
                        min={0}
                        max={1}
                        step={0.01}
                        onChange={handleSliderChange}
                        onMouseDown={handleSeekMouseDown}
                        onMouseUp={handleSeekMouseUp}
                    />
                </div>
                <ReactPlayer
                    ref={reactPlayerRef}
                    url={state.song.url} playing={state.isPlaying}
                    hidden
                    onProgress={({ played, playedSeconds }) => {
                        if(!seeking) {
                            setPlayed(played)
                            setPlayedSeconds(playedSeconds)
                        }
                    }}
                />
                <CardMedia
                    className={classes.thumbnail}
                    image={state.song.thumbnail}
                />

            </Card>
            <QueuedSongList queue={data.queue}/>
        </>

    )
}

export default SongPlayer;
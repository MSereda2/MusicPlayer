import React from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import CardActions from "@material-ui/core/CardActions";
import IconButton from "@material-ui/core/IconButton";
import {Pause, PlayArrow, Save} from "@material-ui/icons";
import {makeStyles} from "@material-ui/core/styles";
import {useMutation, useQuery, useSubscription} from "@apollo/react-hooks";
import {GET_SONGS} from "../graphql/subscriptions";
import {SongContext} from "../App";
import {ADD_OR_REMOVE_FROM_QUEUE} from "../graphql/mutations";

const useStyles = makeStyles(theme => ({
    container: {
        margin: theme.spacing(3),
    },
    songInfoContainer: {
        display: 'flex',
        alignItems: 'center',
    },
    songInfo: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between'
    },
    thumbnail: {
        objectFit: "cover",
        width: 140,
        height: 140
    }
}))

const SongList = () => {
   const {data, loading, error} = useSubscription(GET_SONGS);

    if (loading) {
        return (
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: 'center',
                marginTop: 50
            }}>
                <CircularProgress />
            </div>
        )
    }
    if(error) {
        return <div>ERROR fetching songs</div>
    }
    return (
        <div>
            {data.songs.map((song) => (
            <Song key={song.id} song={song} />
        ))}</div>
    )
}

const Song = ({ song }) => {
    const { thumbnail, title, artist, id } = song;
    const classes = useStyles();
    const [ addOrRemoveFromQueue ] = useMutation(ADD_OR_REMOVE_FROM_QUEUE, {
        onCompleted: data => {
            localStorage.setItem('queue', JSON.stringify(data.addOrRemoveFromQueue))
        }
    })
    const [ currentSongPlaying, setCurrentSongPlaying ] = React.useState(false);
    const { state, dispatch } = React.useContext(SongContext);

    React.useEffect(() => {
        const isSongPlaying = state.isPlaying && id === state.song.id;
        setCurrentSongPlaying(isSongPlaying)
    }, [id, state.song.id, state.isPlaying]);

    const handleTogglePlay = () => {
        dispatch({ type: "SET_SONG", payload: { song } })
        dispatch( state.isPlaying ? { type: "PAUSE_SONG" } : { type: "PLAY_SONG" });
    };

    const handleAddOrRemoveFromQueue = () => {
        addOrRemoveFromQueue({
            variables: { input: { ...song, __typename:  'Song'} }
        })
    }

    return(
        <Card className={classes.container}>
            <div className={classes.songInfoContainer}>
                <CardMedia className={classes.thumbnail} image={thumbnail} />
                <div className={classes.songInfo}>
                    <CardContent>
                        <Typography gutterBottom variant={"h5"} component="h2">
                            {title}
                        </Typography>
                        <Typography variant={"body1"} component="p" color="textSecondary">
                            {artist}
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <IconButton size="small" color="primary" onClick={handleTogglePlay}>
                            { currentSongPlaying ? <Pause /> :  <PlayArrow />}
                        </IconButton>
                        <IconButton onClick={handleAddOrRemoveFromQueue} size="small" color="secondary">
                            <Save />
                        </IconButton>
                    </CardActions>
                </div>
            </div>
        </Card>
    )
}

export default SongList;
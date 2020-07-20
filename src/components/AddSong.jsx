import React from "react";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import {AddBoxOutlined, Link} from "@material-ui/icons";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import {makeStyles} from "@material-ui/core/styles";
import SoundcloudPlayer from 'react-player/lib/players/SoundCloud';
import YoutubePlayer from 'react-player/lib/players/YouTube';
import ReactPlayer from "react-player";
import {useMutation} from "@apollo/react-hooks";
import {ADD_SONG} from "../graphql/mutations";

const useStyles = makeStyles(theme => ({
    container: {
        display: "flex",
        alignItems: "center"
    },
    urlInput: {
        margin: theme.spacing(1)
    },
    addSongButton: {
        margin: theme.spacing(1)
    },
    dialog: {
        textAlign: "center",
    },
    thumbnail: {
        width: '90%'
    }
}));

const DEFAULT_SONG = {
    duration: 0,
    title: "",
    artist: "",
    thumbnail: ""
}

const AddSong = () => {
    const classes = useStyles();
    const [addSong, { error }] = useMutation(ADD_SONG);
    const [url, setUrl] = React.useState('');
    const [playable, setPlayable] = React.useState(false);
    const [dialog, setDialog] = React.useState(false);
    const [song, setSong] = React.useState(DEFAULT_SONG);

    React.useEffect(() => {
        const isPlayable = SoundcloudPlayer.canPlay(url) || YoutubePlayer.canPlay(url);
        setPlayable(isPlayable);
    }, [url]);

    const handleChangeSong = (event) => {
        const {name, value} = event.target;
        setSong(prevSong => ({
            ...prevSong,
            [name]: value
        }))
    };

    const handleClosetDialog = () => {
        setDialog(false)
    };

    const handleEditSong = async ({player}) => {
        const nestedPlayer = player.player.player;
        let songData;
        if (nestedPlayer.getVideoData) {
            songData = getYoutubeInfo(nestedPlayer)
        } else if (nestedPlayer.getCurrentSound) {
            songData = await getSoundclouddInfo(nestedPlayer)
        }
        setSong({...songData, url});
    };

    const getYoutubeInfo = (player) => {
        const duration = player.getDuration();
        const {title, video_id, author} = player.getVideoData();
        const thumbnail = `http://img.youtube.com/vi/${video_id}/0.jpg`;
        return {
            duration,
            title,
            artist: author,
            thumbnail
        }
    };

    const getSoundclouddInfo = (player) => {
        return new Promise(resolve => {
            player.getCurrentSound(songdata => {
                if (songdata) {
                    resolve({
                        duration: Number(songdata.duration / 1000),
                        title: songdata.title,
                        artist: songdata.user.username,
                        thumbnail: songdata.artwork_url.replace('-large', '-t500x500')
                    });
                }
            })
        });
    };

    const handleAddSong = async () => {
        try {
            const {url, thumbnail, duration, title, artist} = song;
            await addSong({
                variables: {
                    url: url.length > 0 ? url : null,
                    thumbnail: thumbnail.length > 0 ? thumbnail : null,
                    duration: duration > 0 ? duration : null,
                    title: title.length > 0 ? title : null,
                    artist: artist.length > 0 ? artist : null,
                }
            });
            handleClosetDialog();
            setSong(DEFAULT_SONG);
            setUrl('')
        } catch (e) {
            console.error('error adding song', e);
        }

    };

    const handleError = (field) => {
        return error?.graphQLErrors[0]?.extensions?.path.includes(field);
    }

    const {thumbnail, artist, title, duration} = song;

    return (
        <div className={classes.container}>
            <Dialog
                className={classes.dialog}
                open={dialog}
                onClose={handleClosetDialog}
            >
                <DialogTitle>Edit song</DialogTitle>
                <DialogContent>
                    <img src={thumbnail}
                         alt="cyberbank"
                         className={classes.thumbnail}
                    />
                    <TextField
                        value={title}
                        onChange={handleChangeSong}
                        margin={"dense"}
                        name="title"
                        label="Title"
                        fullWidth
                        error={handleError('title')}
                        helperText={handleError('title') && 'Fill out field'}
                    />
                    <TextField
                        value={artist}
                        onChange={handleChangeSong}
                        margin={"dense"}
                        name="artist"
                        label="Artist"
                        error={handleError('artist')}
                        helperText={handleError('artist') && 'Fill out field'}
                        fullWidth
                    />
                    <TextField
                        value={thumbnail}
                        onChange={handleChangeSong}
                        margin={"dense"}
                        name="thumbnail"
                        label="Thumbnail"
                        fullWidth
                        error={handleError('thumbnail')}
                        helperText={handleError('thumbnail') && 'Fill out field'}
                    />
                </DialogContent>
                <DialogActions>
                    <Button color='secondary' onClick={handleClosetDialog}>
                        Cancel
                    </Button>
                    <Button onClick={handleAddSong} color='secondary' variant="outlined">
                        Add song
                    </Button>
                </DialogActions>
            </Dialog>
            <TextField
                onChange={event => setUrl(event.target.value)}
                value={url}
                className={classes.urlInput}
                placeholder="Add youtube our soundcloud url"
                fullWidth
                margin='normal'
                type="url"
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Link/>
                        </InputAdornment>
                    )
                }}
            />
            <Button
                disabled={!playable}
                className={classes.addSongButton}
                onClick={() => setDialog(true)}
                variant="contained"
                color="primary"
                endIcon={<AddBoxOutlined/>}>
                Add
            </Button>
            <ReactPlayer url={url} hidden onReady={handleEditSong}/>
        </div>
    )
}

export default AddSong;
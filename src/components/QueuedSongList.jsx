import React from "react";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import {Delete} from "@material-ui/icons";
import IconButton from "@material-ui/core/IconButton";
import {makeStyles} from "@material-ui/core/styles";
import { useMediaQuery } from "@material-ui/core";
import {useMutation} from "@apollo/react-hooks";
import {ADD_OR_REMOVE_FROM_QUEUE} from "../graphql/mutations";

const useStyles = makeStyles({
    avatar: {
        width: 44,
        height: 44
    },
    text: {
        textOverflow: 'ellipsis',
        overflow: 'hidden'
    },
    container: {
        display: 'grid',
        gridAutoFlow: 'column',
        gridTemplateColumns: '50px auto 50px',
        gridGap: 12,
        alignItems: 'center',
        marginTop: 10
    },
    songInfoContainer: {
        overflow: 'hidden',
        whiteSpace: 'nowrap'
    }
})

const QueuedSongList = ({ queue }) => {
    const graterThanMedium = useMediaQuery(theme => theme.breakpoints.up('md'));




    return graterThanMedium && (
        <div style={{
            margin: '10px 0'
        }}>
            <Typography color={"textSecondary"} variant={"button"}>
                QUEUE ({queue.length})
            </Typography>
            {queue.map((song, i) => (
                <QueuedSong key={i} song={song} />
            ))}
        </div>
    )
}

const QueuedSong = ({ song }) => {
    const classes = useStyles()
    const { thumbnail, artist, title } = song;
    const [ addOrRemoveFromQueue ] = useMutation(ADD_OR_REMOVE_FROM_QUEUE, {
        onCompleted: data => {
            localStorage.setItem('queue', JSON.stringify(data.addOrRemoveFromQueue))
        }
    })


    const handleAddOrRemoveFromQueue = () => {
        addOrRemoveFromQueue({
            variables: { input: { ...song, __typename:  'Song'} }
        })
    }


    return(
        <div className={classes.container}>
            <Avatar src={thumbnail} alt={'song thumbnail'} className={classes.avatar} />
            <div className={classes.songInfoContainer}>
                <Typography variant={"subtitle2"} className={classes.text}>
                    {title}
                </Typography>
                <Typography color={"textSecondary"} variant={"body2"} className={classes.text} >
                    {artist}
                </Typography>
            </div>
            <IconButton onClick={ handleAddOrRemoveFromQueue }>
                <Delete color={"error"} />
            </IconButton>
        </div>
    )
}

export default QueuedSongList;
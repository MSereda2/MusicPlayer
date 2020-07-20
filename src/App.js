import React from 'react';
import Header from "./components/Header";
import AddSong from "./components/AddSong";
import SongList from "./components/SongList";
import SongPlayer from "./components/SongPlayer";
import Grid from "@material-ui/core/Grid";
import {useMediaQuery, Hidden} from '@material-ui/core';
import songReducer from "./reducers";

export const SongContext = React.createContext({
    song: {
        id: `486d3329-3b0b-4420-b244-b0ea2bc55ccc`,
        title: 'Кайфы',
        artist: 'Ганвест',
        thumbnail: 'https://lh3.googleusercontent.com/proxy/I31eWm1XVNb7-RK6SbjC3nWhkMw_iKWjPCsze_uB1Y9B4ZD-RbjtfMYUDsuF1GSUxTHrrUimqF0Mj_kZF_8vzF3_5vfmgWTg4Z-kRJW1',
        duration: 250,
        url: 'https://www.youtube.com/watch?v=Vuf6ryNdnt8'


    },
    isPlaying: false
})


function App() {
    const initialSongState = React.useContext(SongContext);
    const [ state, dispatch ] = React.useReducer(songReducer, initialSongState);
    const graterThanSmall = useMediaQuery(theme => theme.breakpoints.up('sm'));
    const graterThanMedium = useMediaQuery(theme => theme.breakpoints.up('md'));

    return (
        <SongContext.Provider value={{state, dispatch}}>
            <Hidden only={"xs"}>
                <Header/>
            </Hidden>
            <Grid container spacing={3}>
                <Grid
                    style={{ paddingTop: graterThanSmall ? '80px' : '10px' }}
                    item xs={12}
                    md={7}
                >
                    <AddSong/>
                    <SongList/>
                </Grid>
                <Grid
                    style={
                       graterThanMedium ? {
                        position: 'fixed',
                        width: '100%',
                        right: 0,
                        top: 70
                    } : {
                           position: 'fixed',
                           width: '100%',
                           left: 0,
                           bottom: 0
                       }}
                    item xs={12}
                    md={5}
                >
                    <SongPlayer/>
                </Grid>
            </Grid>
        </SongContext.Provider>
    );
}

export default App;

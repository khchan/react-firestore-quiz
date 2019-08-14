import React from 'react';
import {storage} from '../firebase.js';

const storageRef = storage.ref();
class CharacterSelect extends React.Component {
    
    state = {
        images: []
    }

    // TODO: This is weird
    componentWillMount() {
        let self = this;
        storageRef.child('images').listAll()
            .then(refs => {
                return Promise.all(refs.items.map(ref => ref.getDownloadURL()));
            })
            .then(urls => {
                this.setState({images: urls});
            });
    }
    
    render() {
        const images = this.state.images.map((url, i) => {
            return <img key={`image-${i}`} src={url}></img>
        });
        return (
            <div>
                <h2>Character Select</h2>
                {images}
            </div>
        );
    }
}

export default CharacterSelect;
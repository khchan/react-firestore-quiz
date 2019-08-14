import React from 'react';
import '../styles/CharacterSelect.css';

class CharacterSelect extends React.Component {
    
    state = {
        images: []
    }
    
    render() {
        const images = Array.from({ length: 30 }).map((u, i) => {
            return <img key={`image-${i}`} alt="img" src={'http://placekitten.com/100/100'}></img>;
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
import React from 'react';

class CharacterCard extends React.Component {
    
    render() {
        return (
            <div className="character-card">
                <img alt='Avatar' className={this.props.cardClass} src={this.props.profileImg}></img>
                <div className="text">
                    {this.props.cardText}
                </div>
            </div>
        );
    }
}

export default CharacterCard;
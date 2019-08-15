import React from 'react';
import '../styles/CharacterSelect.css';
import { Profiles } from '../constants/Profiles.js';

class CharacterSelect extends React.Component {

    state = {
        selectedProfile: null,
        profiles: Profiles
    }

    selectCharacter(profile) {
        this.setState({selectedProfile: profile});
    }

    filterProfiles = (event) => {
        let filtered = Profiles.filter(profile => {
            let profileName = profile.firstName.toLowerCase() + profile.lastName.toLowerCase() + profile.association.toLowerCase()
            return profileName.indexOf(event.target.value.toLowerCase()) !== -1;
        });

        this.setState({ profiles: filtered });
    }

    render() {
        const images = this.state.profiles.map(profile => {
            const profileName = `${profile.firstName}-${profile.lastName}`;
            return (
                <div className='card' key={profileName} onClick={() => this.selectCharacter(profile)}>
                    <img alt='Avatar' src={profile.img}></img>
                    <div className="text">
                        <span>{profile.firstName}<br />{profile.lastName}</span>
                    </div>
                </div>
            );
        });

        return (
            <div>
                <input type='text' className='search' placeholder='&#xE11A;Character Select' onChange={this.filterProfiles} />
                <div className="cards">{images}</div>
            </div>
        );
    }
}

export default CharacterSelect;
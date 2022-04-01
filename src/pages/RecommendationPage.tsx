import { useContext, useEffect, useState } from 'react';
import { MultiSelect } from 'react-multi-select-component';

import PlayerListTrack from '../components/PlayerList/PlayerListTrack';
import Track from '../types/Track';
import { getSmallestImage, makeRequest, ucwords } from '../utils/helpers';
import { AuthContext } from '../context/auth-context';
import Artist from '../types/Artist';
import { MdSearch } from 'react-icons/md';
import Loader from '../components/Loader/Loader';
import Button from '../components/Button/Button';
import Modal from '../components/Modal/Modal';
import PlayListForm from '../components/Form/PlayListForm';

interface Option {
  value: any;
  label: string;
  key?: string;
  disabled?: boolean;
  image?: string;
}

interface IDefaultItemRendererProps {
  checked: boolean;
  option: Option;
  disabled?: boolean;
  onClick?: () => {};
}

const isArtist = (item: any): item is Artist => {
  return item.type === 'artist';
};

const mapDropDown = (item: Artist | Track) => {
  const returnData = {
    value: item.id,
    label: item.name,
    key: item.id,
    image: '',
  };
  if (isArtist(item)) {
    returnData.image = getSmallestImage(item.images);
  } else {
    returnData.label = `${item.artists[0].name} - ${item.name}`;
    returnData.image = getSmallestImage(item.album.images);
  }

  return returnData;
};

const initialPlaylistForm = {
  id: '',
  name: 'My Recommended Tracks',
  description: '',
  image: '',
  isPublic: false,
  isOwn: false,
  previewImage: '',
};

const RecommendationPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recommendationTracks, setRecomendationTracks] = useState<Track[]>([]);
  const [availableGenres, setAvailableGenres] = useState<Option[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<Option[]>([]);
  const [selectedTracks, setSelectedTracks] = useState<Option[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<Option[]>([]);

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [playlistForm, setPlaylistForm] = useState(initialPlaylistForm);

  const { isLoggedIn } = useContext(AuthContext);


  useEffect(() => {
    const fetchAvailableGenreSeeds = async () => {
      try {
        const response = await makeRequest('/recommendations/available-genre-seeds', {}, isLoggedIn);
        setAvailableGenres(response.data.genres.map((genre: string) => ({
          label: genre,
          value: genre,
          key: genre,
        })));
      } catch (error) {
        console.error(error);
      }
    };

    fetchAvailableGenreSeeds();
  }, [isLoggedIn]);

  const handleSearchRecommendation = async () => {
    const totalSelected = selectedArtists.length + selectedTracks.length + selectedGenres.length;
    if (totalSelected === 0) return;
    try {
      setIsLoading(true);
      setRecomendationTracks([]);
      const params = {
        seed_artists: selectedArtists.map((v) => v.value).join(','),
        seed_tracks: selectedTracks.map((v) => v.value).join(','),
        seed_genres: selectedGenres.map((v) => v.value).join(','),
        limit: 100,
      };
      const response = await makeRequest('/recommendations', { params }, isLoggedIn);
      setRecomendationTracks(response.data.tracks);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (
    type: 'artist' | 'track' | 'genre',
    option: Option[],
    keyword: string
  ) => {
    let selected;
    if (type === 'artist') {
      selected = selectedArtists;
    } else if (type === 'track') {
      selected = selectedTracks;
    } else if (type === 'genre') {
      return [
        ...selectedGenres,
        ...option.filter((opt) => opt.value.includes(keyword.toLowerCase())),
      ].filter((v, i, a) => a.findIndex((t) => t.value === v.value) === i);
    } else {
      return [];
    }

    if (keyword.trim() === '') return selected;
    const response = await makeRequest('/search', {
      params: {
        q: keyword,
        type,
        limit: 5,
      },
    }, isLoggedIn);

    const datas = response.data[`${type}s`].items;
    return [
      ...selected,
      ...datas.map(mapDropDown),
    ].filter((v, i, a) => a.findIndex((t) => t.value === v.value) === i);
  };

  const CustomItemRenderer = ({
    checked,
    option,
    onClick,
    disabled,
  }: IDefaultItemRendererProps) => {
    return (
      <div className={`${disabled && "disabled"} flex items-center text-gray-800 text-xs`}>
        <input
          type="checkbox"
          onChange={onClick}
          checked={checked}
          tabIndex={-1}
          disabled={disabled}
          className="hidden"
        />
        <div className="w-8 h-8 bg-transparent mr-4">
          {option.image && (
            <img
              className="w-full h-full rounded-sm"
              src={option.image}
              alt={option.label}
            />
          )}
        </div>
        <div>{option.label}</div>
      </div>
    );
  };

  const customValueRenderer = (
    type: 'artist' | 'track' | 'genre',
    selected: Option[],
    options: Option[]
  ) => {
    if (selected.length < 1) return `Select ${ucwords(type)}`;
    return (
      <div className="flex items-center text-xxs">
        {selected.map((sel) => (
          <div key={sel.value} className="flex items-center rounded-md bg-gray-300 px-2 py-1 mr-2">
            <span className="font-bold mr-2">{sel.label.split(' - ')[sel.label.split(' - ').length - 1]}</span>
          </div>
        ))}
      </div>

    );
  };

  const handleChangeFilter = (
    type: 'artist' | 'track' | 'genre',
    values: Option[]
  ) => {
    let totalSelected = selectedArtists.length + selectedTracks.length + selectedGenres.length;
    let selected;
    let stateFn;
    if (type === 'artist') {
      selected = selectedArtists;
      stateFn = setSelectedArtists;
    } else if (type === 'track') {
      selected = selectedTracks;
      stateFn = setSelectedTracks;
    } else if (type === 'genre') {
      selected = selectedGenres;
      stateFn = setSelectedGenres;
    } else {
      return;
    }

    totalSelected = totalSelected - selected.length + values.length;
    if (totalSelected > 5) {
      return;
    }
    stateFn(values);
  };

  const handleCloseModal = () => {
    setPlaylistForm((prevState) => ({
      ...prevState,
      ...initialPlaylistForm,
    }));
    setIsOpenModal(false);
  };

  return (
    <div className="flex flex-col sm:p-4 p-2">
      <div className="mb-4">
        Find recommended tracks based on your criteria. <span className="italic text-xs">(Max 5 selections)</span>
      </div>
      <div className="mb-8">
        <div className="flex items-end md:items-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-11/12 mr-4">
            <MultiSelect
              className="text-gray-800"
              hasSelectAll={false}
              options={[]}
              value={selectedArtists}
              onChange={(values: Option[]) => handleChangeFilter('artist', values)}
              labelledBy="Select Artists"
              valueRenderer={(selected, options) => customValueRenderer('artist', selected, options)}
              debounceDuration={500}
              filterOptions={(option, keyword) => handleSearch('artist', option, keyword)}
              ItemRenderer={CustomItemRenderer}
            />
            <MultiSelect
              className="text-gray-800"
              hasSelectAll={false}
              options={[]}
              value={selectedTracks}
              onChange={(values: Option[]) => handleChangeFilter('track', values)}
              labelledBy="Select Tracks"
              valueRenderer={(selected, options) => customValueRenderer('track', selected, options)}
              debounceDuration={500}
              filterOptions={(option, keyword) => handleSearch('track', option, keyword)}
              ItemRenderer={CustomItemRenderer}
            />
            <MultiSelect
              className="text-gray-800"
              hasSelectAll={false}
              options={availableGenres}
              value={selectedGenres}
              onChange={(values: Option[]) => handleChangeFilter('genre', values)}
              labelledBy="Select Tracks"
              valueRenderer={(selected, options) => customValueRenderer('genre', selected, options)}
              debounceDuration={500}
              filterOptions={(option, keyword) => handleSearch('genre', option, keyword)}
              ItemRenderer={CustomItemRenderer}
            />
          </div>
          <button
            className="rounded-md flex items-center bg-light-black-2 py-3 px-3 cursor-pointer hover:bg-opacity-80"
            onClick={handleSearchRecommendation}
          >
            <MdSearch />
          </button>
        </div>
      </div>
      <div className="flex justify-center">
        {isLoading && (
          <div className="flex justify-center">
            <Loader />
          </div>
        )}
        {!isLoading && (
          <>
            {recommendationTracks.length > 0 && (
              <div className="">
                <div
                  className="inline-block"
                  data-tip="create-playlist"
                  data-for="login-tooltip"
                  data-event="click"
                  data-place="right"
                > 
                  <Button
                    data-tip="create-playlist"
                    data-for="login-tooltip"
                    data-event="click"
                    data-place="right"
                    className=""
                    text="Convert to playlist"
                    color="green"
                    onClick={() => setIsOpenModal(true)}
                  />
                </div>
                <PlayerListTrack
                  tracks={recommendationTracks}
                  showAlbum
                  uris={recommendationTracks.map((track) => track.uri)}
                  handleNext={() => {}}
                  hasMore={false}
                />
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        show={isOpenModal}
        title="Playlist"
        handleCloseModal={handleCloseModal}
      >
        <PlayListForm
          id={playlistForm.id}
          name={playlistForm.name}
          description={playlistForm.description}
          image={playlistForm.image}
          isPublic={playlistForm.isPublic}
          isOwn={playlistForm.isOwn}
          previewImage={playlistForm.previewImage}
          onSave={handleCloseModal}
          tracks={recommendationTracks}
        />
      </Modal>
    </div>
  );
};

export default RecommendationPage;

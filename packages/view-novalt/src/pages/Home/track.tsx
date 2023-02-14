import './track.css';
import TrackFile from './track-file';
import TrackInput from './track-input';
import { TrackOption } from '../../plugins/live-context';

export type TrackProps = {
  option: TrackOption;
  onChange: (option: TrackOption) => void;
  onDelete: () => void;
};

export default function Track(prop: TrackProps) {
	switch (prop.option.type) {
    case 'file':
      return <TrackFile
        option={prop.option}
        onChange={prop.onChange}
        onDelete={() => prop.onDelete()} />;
    case 'input':
      return <TrackInput
        option={prop.option}
        onChange={prop.onChange}
        onDelete={() => prop.onDelete()}
      />;
  }
  return <></>;
}
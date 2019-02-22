import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
import { createRef, MutableRefObject, ReactNode } from 'react';
import { useControllableState } from './useControllableState';

configure({ adapter: new Adapter() });


describe('useControllableState', () => {

  const spyWarn = jest.spyOn( console, 'warn' );

  beforeEach(() => {
    // Resetting mock fails test. TODO: why?
    // spyWarn.mockReset();
  });

  it('should work when neither value is controlled nor change handler is passed', () => {
    const { clickHeader, isOpen } = mountUsage();
    expect(isOpen()).toBe(false);
    clickHeader();
    expect(isOpen()).toBe(true);
    clickHeader();
    expect(isOpen()).toBe(false);
  });


  it('should handle uncontrolled value and change callback', () => {
    const onToggleSpy = jest.fn();
    const { clickHeader } = mountUsage(<Zippy header={'header'} onToggle={onToggleSpy}/>);
    clickHeader();
    expect(onToggleSpy).toBeCalledWith(true);
    clickHeader();
    expect(onToggleSpy).toBeCalledWith(false);
    expect(onToggleSpy).toHaveBeenCalledTimes(2);
  });

  it('should work in controlled mode', () => {
    class ControlledUsage extends React.Component<{}, { counter: number, open: boolean }> {
      constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
      }

      state = {
        counter: 0,
        open: true,
      };

      toggle(value: boolean) {
        if (this.state.counter < 2) {
          this.setState(state => ({
            open: !state.open,
            counter: state.counter + 1,
          }));
        }
      }

      render(): React.ReactNode {
        return <Zippy header={'header'}
                      open={this.state.open} onToggle={this.toggle}/>;
      }
    }

    const { clickHeader, isOpen } = mountUsage(<ControlledUsage/>);
    expect(isOpen()).toEqual(true);
    clickHeader();
    expect(isOpen()).toEqual(false);
    clickHeader();
    expect(isOpen()).toEqual(true);
    clickHeader();
    expect(isOpen()).toEqual(true);
  });

  it('should work when value is controlled but changes are ignored (readonly mode)', () => {
    const { clickHeader, isOpen } = mountUsage(<Zippy header={'header'} open={true}/>);
    expect(isOpen()).toEqual(true);
    clickHeader();
    expect(isOpen()).toEqual(true);
    clickHeader();
    expect(isOpen()).toEqual(true);
  });

  it('should return identical setter functions (like useState), unless onChange is changed', () => {
    const toggleRef: Props['toggleRef'] = createRef();
    const { clickHeader } = mountUsage(<Zippy header={'header'}
                                              toggleRef={toggleRef} />);
    const firstToggle = toggleRef.current;
    clickHeader();
    const secondToggle = toggleRef.current;
    expect(firstToggle).toEqual(secondToggle);
  });


  it('should warn user if control mode is changed', () => {
    class ControlledUsage extends React.Component<{}, { counter: number, open: boolean }> {
      constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
      }

      state = {
        counter: 0,
        open: true,
      };

      toggle(value: boolean) {
        if (this.state.counter < 2) {
          this.setState(state => ({
            open: !state.open,
            counter: state.counter + 1,
          }));
        }
      }

      render(): React.ReactNode {
        return <Zippy header={'header'}
                      open={this.state.open} onToggle={this.toggle}/>;
      }
    }
    const { wrapper } = mountUsage(<ControlledUsage />);
    wrapper.setState({ open: undefined });
    expect(spyWarn).toBeCalled();
  });

});


function mountUsage(usage = <Zippy header='header'/>) {
  const wrapper = mount(usage);
  return {
    wrapper,
    isOpen: () => wrapper.find('.zippy-content').length > 0,
    clickHeader: () => wrapper.find('.zippy-header').simulate('click'),
  };
}

interface Props {
  open?: boolean;
  header: ReactNode;
  onToggle?: (value: boolean) => boolean | void;
  children?: ReactNode;
  toggleRef?: MutableRefObject<this['onToggle']>;
}

function Zippy({ open, onToggle, children, header, toggleRef }: Props) {
  const [openState, setOpen] = useControllableState(open, onToggle, false);
  if (toggleRef) {
    toggleRef.current = setOpen;
  }
  return <div className="zippy">
    <div onClick={() => setOpen(!openState)} className="zippy-header">
      <span>{openState ? '▼' : '▶'}</span> &nbsp;
      {header}
    </div>
    {openState ? <div className="zippy-content">{children}</div> : null}
  </div>;
}

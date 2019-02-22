import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
import { useControlledState } from './useControlledState';

configure({ adapter: new Adapter() });


describe('useControlledState', () => {

  it('should work when neither value is controlled nor change handler is passed', () => {
    const { increaseBtn, valueEl } = mountUsage();
    increaseBtn.simulate('click');
    increaseBtn.simulate('click');
    expect(valueEl.html()).toContain('2');
  });


  it('should handle uncontrolled value and change callback', () => {
    const changeSpy = jest.fn();
    const { increaseBtn } = mountUsage(<Counter changeHandler={changeSpy}/>);
    increaseBtn.simulate('click');
    expect(changeSpy).toBeCalledWith(1);
    increaseBtn.simulate('click');
    expect(changeSpy).toBeCalledWith(2);
    expect(changeSpy).toHaveBeenCalledTimes(2);
  });

  it('should work in controlled mode', () => {
    class ControlledUsage extends React.Component<{}, { value: number }> {
      constructor(props) {
        super(props);
        this.setValue = this.setValue.bind(this);
      }

      state = {
        value: 2,
      };

      setValue(value) {
        if (value < 5) {
          this.setState({ value });
        }
      }

      render(): React.ReactNode {
        return <Counter value={this.state.value} changeHandler={this.setValue}/>;
      }
    }

    const { increaseBtn, valueEl } = mountUsage(<ControlledUsage/>);
    expect(valueEl.text()).toEqual('2');
    increaseBtn.simulate('click');
    expect(valueEl.text()).toEqual('3');
    increaseBtn.simulate('click');
    expect(valueEl.text()).toEqual('4');
    increaseBtn.simulate('click');
    expect(valueEl.text()).toEqual('4');
  });

  it('should work when value is controlled but changes are ignored (readonly mode)', () => {
    const { increaseBtn, valueEl } = mountUsage(<Counter value={3}/>);
    increaseBtn.simulate('click');
    increaseBtn.simulate('click');
    expect(valueEl.text()).toEqual('3');
  });
});


function mountUsage(usage = <Counter/>) {
  const wrapper = mount(usage);
  return {
    wrapper,
    valueEl: wrapper.find('.value'),
    increaseBtn: wrapper.find('.btn'),
  };
}

interface UsageProps {
  value?: number;
  changeHandler?: (value: number) => number | void;
}

function Counter({ value, changeHandler }: UsageProps) {
  const [valueState, setValue] = useControlledState(value, changeHandler, 0);

  return <div>
    <span className="value">{valueState}</span>
    <button className="btn" onClick={() => setValue(valueState + 1)}>Increase</button>
  </div>;
}

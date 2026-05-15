export const exampleSysmlSource = `package VehicleModel {
  package Structure {
    interface def PowerSource {
      port outputPower : FlowPort;
    }

    part def Engine {
      attribute cylinderCount : Integer;
      port outputPower : FlowPort;
    }

    part def Wheel {
      attribute radius : cm;
      port axleConnect : MechanicalPort;
    }

    part def Vehicle {
      part engine : Engine;
      part wheelFL : Wheel;
      part wheelFR : Wheel;
      part wheelRL : Wheel;
      part wheelRR : Wheel;
      connect engine.outputPower to wheelFL.axleConnect : binding;
      connect engine.outputPower to wheelFR.axleConnect : binding;
    }
  }

  package Requirements {
    requirement def SafetyRequirement {
      id = "SAFE-001";
      text = "系统必须在紧急情况下 3 秒内停止";
    }

    requirement def PerformanceRequirement {
      id = "PERF-001";
      text = "最高时速不低于 200km/h";
    }

    part def BrakeSystem {
      satisfy SafetyRequirement;
    }
  }
}
`;


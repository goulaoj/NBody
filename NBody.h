#ifndef __NBODYSIM__
#define __NBODYSIM__


#include <emscripten/bind.h>
#include <vector>
#include <cmath>
#include "ODEpoint.h"
#include "ODEsolver.h"


class NBodySim {

    public:
        void initialize(int numBodies, double g);
        void setBody(int index, double mass, double x, double y, double vx, double vy);
        void setG(double newG);
        void setSoftening(double newe);
        void step(double dt);
        double getKineticEnergy(); 
        double getPotencialEnergy();
        double getTotalEnergy();
        double getAngularMomentum();
        emscripten::val getPositions() const;
        emscripten::val getVelocities() const;
        emscripten::val getMasses() const;

        
    private:
        std::vector<double> M;
        std::vector<double> X;
        std::vector<double> V;
        double G;
        double t;
        double e;

        const std::vector<std::function<double(ODEpoint)>> GetFunctions();
        ODEpoint GetODEpoint();
        void Update(ODEpoint p);

};



#endif //__NBODYSIM__
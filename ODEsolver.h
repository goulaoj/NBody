#ifndef __ODESOLVER__
#define __ODESOLVER__

#include <vector>
#include <functional>
#include "ODEpoint.h"
#include <emscripten/bind.h>

class ODEsolver {

    public:

        ODEsolver(const std::vector<std::function<double(ODEpoint)>>& functions);
        
        void RK4(ODEpoint& i, double step);
        
        static ODEpoint createODEpoint(double t, const emscripten::val& xvar);
        
        
    private:
        std::vector<std::function<double(ODEpoint)>> F;
};

#endif // __ODESOLVER__